-- JKA/AF shop schema for Supabase (Postgres).
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run: everything uses IF NOT EXISTS / OR REPLACE.

-- ───────────────────────── Tables ─────────────────────────

create table if not exists users (
  id bigint generated always as identity primary key,
  email text not null,
  password_hash text not null,
  first_name text not null,
  last_name text not null,
  phone text not null default '',
  dojo text not null default '',
  rank text not null default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
create unique index if not exists users_email_key on users (lower(email));

create table if not exists sessions (
  token_hash text primary key,
  user_id bigint not null references users (id) on delete cascade,
  expires_at bigint not null
);

create table if not exists products (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  description text not null default '',
  price_cents integer not null,
  price_note text not null default '',
  image_url text not null default '',
  sale_price_cents integer,
  sale_ends_on text not null default '',
  stock integer,
  free_shipping boolean not null default true,
  options jsonb not null default '[]',
  physical boolean not null default false,
  requires_dojo_approval boolean not null default false,
  active boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists cart_items (
  id bigint generated always as identity primary key,
  user_id bigint references users (id) on delete cascade,
  cart_token text,
  product_id bigint not null,
  selections jsonb not null default '{}',
  quantity integer not null default 1
);
create index if not exists cart_items_user_idx on cart_items (user_id);
create index if not exists cart_items_token_idx on cart_items (cart_token);

create table if not exists orders (
  id bigint generated always as identity primary key,
  user_id bigint not null references users (id),
  status text not null default 'awaiting_payment'
    check (status in ('awaiting_payment', 'paid', 'completed', 'cancelled')),
  payment_method text not null default 'check',
  total_cents integer not null,
  ship_name text not null default '',
  ship_address text not null default '',
  ship_city text not null default '',
  ship_state text not null default '',
  ship_zip text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists orders_user_idx on orders (user_id);

create table if not exists order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references orders (id) on delete cascade,
  product_id bigint,
  name text not null,
  unit_cents integer not null,
  quantity integer not null,
  selections jsonb not null default '[]',
  recurring boolean not null default false,
  free_shipping boolean not null default true
);
create index if not exists order_items_order_idx on order_items (order_id);

create table if not exists dojo_applications (
  id bigint generated always as identity primary key,
  user_id bigint not null references users (id),
  dojo_name text not null,
  chief_instructor text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  data jsonb not null,
  signature text not null default '',
  admin_note text not null default '',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists dojo_applications_user_idx on dojo_applications (user_id);

-- ───────────────────────── Security ─────────────────────────
-- The website talks to the database only from the server with the service-role key.
-- Row Level Security is ON with no policies, so the public (anon) key can read nothing.

alter table users enable row level security;
alter table sessions enable row level security;
alter table products enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table dojo_applications enable row level security;

-- ───────────────────────── Functions (atomic operations) ─────────────────────────

-- Places an order: checks and takes stock, writes the order + items, empties the cart. All or nothing.
-- p_items: [{product_id, name, unit_cents, quantity, selections, recurring, free_shipping}, ...]
create or replace function place_order(
  p_user_id bigint,
  p_total integer,
  p_ship_name text,
  p_ship_address text,
  p_ship_city text,
  p_ship_state text,
  p_ship_zip text,
  p_notes text,
  p_items jsonb
) returns bigint
language plpgsql
as $$
declare
  v_order_id bigint;
  r record;
  v_stock integer;
  v_name text;
begin
  -- Take stock per product (locks the row so two buyers cannot oversell).
  for r in
    select (i ->> 'product_id')::bigint as product_id, sum((i ->> 'quantity')::integer) as qty
    from jsonb_array_elements(p_items) i
    group by 1
  loop
    select stock, name into v_stock, v_name from products where id = r.product_id for update;
    if found and v_stock is not null then
      if v_stock < r.qty then
        raise exception 'Only % of % left in stock.', greatest(v_stock, 0), v_name;
      end if;
      update products set stock = stock - r.qty where id = r.product_id;
    end if;
  end loop;

  insert into orders (user_id, total_cents, ship_name, ship_address, ship_city, ship_state, ship_zip, notes)
  values (p_user_id, p_total, p_ship_name, p_ship_address, p_ship_city, p_ship_state, p_ship_zip, p_notes)
  returning id into v_order_id;

  insert into order_items (order_id, product_id, name, unit_cents, quantity, selections, recurring, free_shipping)
  select v_order_id,
         (i ->> 'product_id')::bigint,
         i ->> 'name',
         (i ->> 'unit_cents')::integer,
         (i ->> 'quantity')::integer,
         coalesce(i -> 'selections', '[]'::jsonb),
         coalesce((i ->> 'recurring')::boolean, false),
         coalesce((i ->> 'free_shipping')::boolean, true)
  from jsonb_array_elements(p_items) i;

  delete from cart_items where user_id = p_user_id;
  return v_order_id;
end;
$$;

-- Changes an order's status and keeps stock right: cancelling returns items to stock, reopening takes them again.
create or replace function set_order_status(p_id bigint, p_status text) returns void
language plpgsql
as $$
declare
  v_old text;
begin
  select status into v_old from orders where id = p_id for update;
  if not found then
    return;
  end if;
  if v_old <> p_status and (v_old = 'cancelled' or p_status = 'cancelled') then
    update products p
       set stock = greatest(p.stock + (case when p_status = 'cancelled' then 1 else -1 end) * oi.qty, 0)
      from (select product_id, sum(quantity) as qty from order_items where order_id = p_id group by product_id) oi
     where p.id = oi.product_id and p.stock is not null;
  end if;
  update orders set status = p_status where id = p_id;
end;
$$;

-- Moves a guest's cart (cookie token) into a signed-in user's cart, merging identical lines.
create or replace function merge_guest_cart(p_token text, p_user_id bigint) returns void
language plpgsql
as $$
declare
  r record;
  v_existing bigint;
begin
  for r in select * from cart_items where cart_token = p_token loop
    select id into v_existing
      from cart_items
     where user_id = p_user_id and product_id = r.product_id and selections = r.selections
     limit 1;
    if v_existing is not null then
      update cart_items set quantity = least(quantity + r.quantity, 99) where id = v_existing;
      delete from cart_items where id = r.id;
    else
      update cart_items set user_id = p_user_id, cart_token = null where id = r.id;
    end if;
  end loop;
end;
$$;

-- Only the server (service role) may call these.
revoke all on function place_order(bigint, integer, text, text, text, text, text, text, jsonb) from public, anon, authenticated;
revoke all on function set_order_status(bigint, text) from public, anon, authenticated;
revoke all on function merge_guest_cart(text, bigint) from public, anon, authenticated;

-- ───────────────────────── Starter products ─────────────────────────
-- Only inserted when the table is empty. Edit them later in the shop admin.

insert into products (slug, name, description, price_cents, price_note, image_url, free_shipping, options, physical, requires_dojo_approval, sort)
select * from (values
  ('renewal-fee-qualifications', 'Renewal Fee - Qualifications', 'Qualification renewal. Levels D, C, B, and A.',
   11400, '', '/jkaaf_logo.png', true,
   '[{"id":"license","label":"License selection","type":"select","required":true,"choices":[{"label":"None","priceCents":0},{"label":"Instructor","priceCents":0},{"label":"Judge","priceCents":0},{"label":"Examiner","priceCents":0}]}]'::jsonb,
   false, false, 0),
  ('jkaaf-patch', 'JKA/AF Patch', 'Official JKA/AF patch.',
   500, '$6 if shipped', '/jkaaf_logo.png', false,
   '[{"id":"delivery","label":"Delivery","type":"select","required":true,"choices":[{"label":"Pick up (no shipping)","priceCents":0,"noShip":true},{"label":"Ship to me (shipping fee)","priceCents":100}]}]'::jsonb,
   true, false, 1),
  ('jkaaf-passport', 'JKA/AF Passport', 'Passport - for members of JKA/AF only.',
   3000, '', '/jkaaf_logo.png', true, '[]'::jsonb, true, false, 2),
  ('jkaaf-club-membership', 'JKA/AF Club Membership',
   'Price per year. Before paying dues, please complete the Dojo Membership application. The club name is chosen from your approved application.',
   14000, 'per year', '/jkaaf_logo.png', true,
   '[{"id":"club","label":"Club name","type":"club","required":true},{"id":"billing","label":"Purchase option","type":"select","required":true,"choices":[{"label":"One-time purchase","priceCents":0},{"label":"Yearly Club - every year until canceled","priceCents":0,"recurring":true}]}]'::jsonb,
   false, true, 3)
) as v(slug, name, description, price_cents, price_note, image_url, free_shipping, options, physical, requires_dojo_approval, sort)
where not exists (select 1 from products);
