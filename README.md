# mp4-footwear

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_l1yTKh0gyo8cK7WEROBZVmsfLZje)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Paystack checkout

Payments use Paystack's hosted checkout. The server calculates each order total from
the current MongoDB product prices, stores an order as `PENDING`, initializes the
transaction in NGN kobo, and confirms payment with Paystack before showing success.
The delivery form is retained, but this project does not currently calculate a
delivery charge or track per-size stock quantities.

1. Copy `.env.example` to `.env.local`.
2. Set `MONGODB_URI` and a long, random `JWT_SECRET`.
3. In your Paystack dashboard, use your **test** API keys for development:
   - `PAYSTACK_SECRET_KEY` must be the test secret key (`sk_test_...`).
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is included for frontend integrations, but
     this hosted redirect flow does not expose or need the public key.
4. Run `pnpm install` if dependencies are not installed, then `pnpm dev`.
5. Add a product through the admin tools (prices are stored in naira), add it to
   the cart, and complete checkout with a Paystack test card from Paystack's
   test-card documentation. Paystack returns to `/checkout/confirmation`; the
   page verifies the reference with the server before reporting success.

Before going live, replace the test keys with live keys from the Paystack
dashboard, configure the webhook URL as
`https://<your-domain>/api/payments/paystack/webhook`, enable the `charge.success`
and `charge.failed` events, and ensure the deployed application is served over
HTTPS. Keep the secret key only in server environment settings. Do not add real
credentials to `.env.example` or commit `.env.local`.

## Order tracking

Each new checkout receives a public order reference and a separate private
tracking code. The raw tracking code is returned once to the checkout browser
and kept in that tab's session storage; only its hash is stored with the order.
Customers need both values at `/track-order`. Older orders that predate these
fields can be tracked using their Paystack payment reference and both the
checkout email and phone; after verification, a public order reference is
assigned for future lookups. The order tracking API is rate-limited using
MongoDB-backed per-IP counters. Administrators can manage fulfillment and
shipping updates from `/admin/orders` after signing in.

This project does not currently have an email delivery provider. Order and
shipping notifications are therefore not sent by email.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.