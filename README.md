This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Turning on card and PayPal payments

The shop takes **checks** today. Card (Stripe) and PayPal are already built in and stay hidden until you add their keys,
so you can switch them on later without changing any code.

**Stripe (credit / debit card)**
1. In Stripe, copy your **Secret key** (use the *test* key first) into `.env.local` as `STRIPE_SECRET_KEY`.
2. In Stripe go to Developers → Webhooks → Add endpoint: `https://YOUR-SITE/api/webhooks/stripe`, events
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`.
   Copy the endpoint's **Signing secret** into `.env.local` as `STRIPE_WEBHOOK_SECRET`.
3. Restart the site. "Credit or debit card" now appears at checkout.

**PayPal**
1. On developer.paypal.com create an app, copy its **Client ID** and **Secret** into `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`
   (keep `PAYPAL_ENV=sandbox` while testing, then `live`).
2. Add a webhook `https://YOUR-SITE/api/webhooks/paypal` for `PAYMENT.CAPTURE.COMPLETED` and put its id in `PAYPAL_WEBHOOK_ID`.
3. Restart the site. "PayPal" now appears at checkout.

**How it works**
- The customer picks a method at checkout, pays on Stripe's or PayPal's own page, and the webhook marks the order **Payment received**
  (they get the usual email). Card numbers never touch this site.
- An unpaid order has **Pay now** buttons on the order page, and a check order can be paid online instead.
- **Refunds:** in the admin dashboard open an order → *Payments & refunds* → **Send refund** (full or partial amount).
  Card and PayPal refunds are sent through Stripe / PayPal; for a check, mail a check and click **Record refund (check mailed)**.
  The customer is emailed. Cancelling a paid order highlights the refund button.
- Refunds made inside the Stripe dashboard are picked up automatically. Refunds made inside PayPal are not, so use the Send refund button.
- Always test with Stripe test mode and the PayPal sandbox before going live.
