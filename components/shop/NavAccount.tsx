"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/app/account/actions";
import { useMe } from "@/components/shop/useMe";

function CartIcon({ count }: { count: number }) {
  return (
    <span className="relative inline-flex">
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2 4h13M9 20a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
    </span>
  );
}

function UserIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 0116 0"
      />
    </svg>
  );
}

const itemClass =
  "block w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer";

/** Account icon with a dropdown: Sign in / Create account when signed out; Account, My orders, Sign out when signed in. */
function AccountMenu() {
  const me = useMe();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pointer = useRef("mouse");

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) =>
      !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const signedIn = !!me?.name;
  return (
    <div
      ref={ref}
      className="relative"
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
    >
      <button
        type="button"
        onPointerDown={(e) => (pointer.current = e.pointerType)}
        onClick={() => setOpen((o) => (pointer.current === "mouse" ? true : !o))}
        aria-label={signedIn ? "Account menu" : "Sign in"}
        aria-expanded={open}
        className={`p-2 transition-colors cursor-pointer ${signedIn ? "text-red-600" : "text-gray-700 hover:text-red-600"}`}
      >
        <UserIcon />
      </button>
      {open && (
        <div className="absolute right-0 top-full pt-3 w-56 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2">
            {signedIn ? (
              <>
                <p className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 truncate">
                  {me?.name}
                </p>
                <Link href="/account" className={itemClass}>
                  Account
                </Link>
                <Link href="/shop/orders" className={itemClass}>
                  My orders
                </Link>
                <form
                  action={logoutAction}
                  onSubmit={() =>
                    setTimeout(
                      () => window.dispatchEvent(new Event("cart-updated")),
                      500,
                    )
                  }
                >
                  <button
                    type="submit"
                    className={`${itemClass} border-t border-gray-100 mt-1`}
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/account/login" className={itemClass}>
                  Sign in
                </Link>
                <Link href="/account/register" className={itemClass}>
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Account icon and cart icon (with item count) for the navbar. */
export default function NavAccount({
  variant,
}: {
  variant: "desktop" | "bar";
}) {
  const me = useMe();
  return (
    <div className={`flex items-center ${variant === "desktop" ? "ml-1" : ""}`}>
      <AccountMenu />
      <Link
        href="/shop/cart"
        aria-label="Cart"
        className="p-2 text-gray-700 hover:text-red-600 transition-colors inline-flex"
      >
        <CartIcon count={me?.cart ?? 0} />
      </Link>
    </div>
  );
}
