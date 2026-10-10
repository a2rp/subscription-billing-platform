![Ledgerline billing workspace](./screenshot.png)

# Ledgerline

Ledgerline is a subscription billing workspace for reviewing recurring revenue, customer accounts, plans, subscriptions, and invoices. It is a frontend-only demo built with React and Vite.

## Workspace pages

| Page             | Route                  | What it contains                                               |
| ---------------- | ---------------------- | -------------------------------------------------------------- |
| Billing overview | `/`                    | Revenue summary, trend, upcoming renewals, and recent invoices |
| Subscriptions    | `/subscriptions`       | Searchable subscription register with status and plan filters  |
| Invoices         | `/invoices`            | Invoice ledger, balances, payment actions, and CSV export      |
| Customers        | `/customers`           | Account directory with customer profiles and billing history   |
| Plans            | `/plans`               | Plan catalog, pricing, terms, and linked account totals        |
| Revenue report   | `/reports`             | Collected revenue, open balances, and a period-based breakdown |
| Not found        | Any unrecognized route | A return path to the billing workspace                         |

## What works

- Create, edit, view, and remove customers, plans, subscriptions, and invoices. Deletions use a custom confirmation dialog that describes related records affected by the action.
- Validate required fields, email addresses, duplicate customer emails and plan names, numeric amounts, and date ranges before saving.
- Search records from the header with `Ctrl+K`, or use the filters and sorting on each register.
- Update subscription status by canceling or reactivating it. A canceled subscription remains available in the register.
- Mark open or overdue invoices as paid. Paying an invoice also reactivates its linked past-due subscription.
- Record that a payment reminder was noted. This demo does not send email.
- Review derived totals across the overview, registers, and revenue report. Export invoices, subscriptions, plans, and summary data as CSV.
- Use keyboard-accessible dialogs, focus handling, escape-to-close, toast feedback, responsive navigation, and mobile layouts.

Changes live in React memory for the current browser session. Refreshing the page resets the demo records to their original sample data. The app does not use browser storage, a backend, a payment gateway, or a mail service. Payment and reminder actions update only the local demo state.

## Run locally

Use Node.js `20.19+` or `22.12+` and npm.

```sh
npm install
npm run dev
```

Useful checks and publishing command:

```sh
npm run lint
npm run build
npm run preview
npm run deploy
```

The deploy script builds the app, creates the GitHub Pages SPA fallback, and publishes `dist` to the `gh-pages` branch. The project site is [https://a2rp.github.io/subscription-billing-platform/](https://a2rp.github.io/subscription-billing-platform/).

## Screenshots

These captures show the current workspace pages and the dialogs available from the interface. The mobile overview demonstrates the narrow-screen layout.

### Pages

| Page             | Capture                                                                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Billing overview | <img src="./screenshots/pages/overview.png" alt="Ledgerline billing overview with recurring revenue, renewal schedule, and recent invoices" width="620" /> |
| Subscriptions    | <img src="./screenshots/pages/subscriptions.png" alt="Subscription register with status, renewal, and plan details" width="620" />                         |
| Invoices         | <img src="./screenshots/pages/invoices.png" alt="Invoice ledger with balances, statuses, and payment actions" width="620" />                               |
| Customers        | <img src="./screenshots/pages/customers.png" alt="Customer directory and selected billing profile" width="620" />                                          |
| Plans            | <img src="./screenshots/pages/plans.png" alt="Subscription plan catalog and plan terms" width="620" />                                                     |
| Revenue report   | <img src="./screenshots/pages/revenue-report.png" alt="Revenue report with collected and outstanding billing totals" width="620" />                        |
| Not found        | <img src="./screenshots/pages/not-found.png" alt="Not found page with navigation back to billing" width="620" />                                           |
| Mobile overview  | <img src="./screenshots/pages/mobile-overview.png" alt="Ledgerline billing overview at a 390 pixel mobile viewport" width="300" />                         |

### Customer dialogs

| Dialog state          | Capture                                                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Create customer       | <img src="./screenshots/modals/customer-create.png" alt="New customer form" width="620" />                                        |
| Invalid billing email | <img src="./screenshots/modals/customer-email-validation.png" alt="Customer form showing billing email validation" width="620" /> |
| Edit customer         | <img src="./screenshots/modals/customer-edit.png" alt="Edit customer form" width="620" />                                         |
| Customer details      | <img src="./screenshots/modals/customer-details.png" alt="Customer billing profile details dialog" width="620" />                 |
| Delete confirmation   | <img src="./screenshots/modals/customer-delete-confirm.png" alt="Confirmation before deleting a customer" width="620" />          |

### Plan dialogs

| Dialog state        | Capture                                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Create plan         | <img src="./screenshots/modals/plan-create.png" alt="New plan form" width="620" />                               |
| Plan details        | <img src="./screenshots/modals/plan-details.png" alt="Plan terms and linked subscriptions dialog" width="620" /> |
| Edit plan           | <img src="./screenshots/modals/plan-edit.png" alt="Edit plan form" width="620" />                                |
| Delete confirmation | <img src="./screenshots/modals/plan-delete-confirm.png" alt="Confirmation before deleting a plan" width="620" /> |

### Subscription dialogs

| Dialog state         | Capture                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Create subscription  | <img src="./screenshots/modals/subscription-create.png" alt="New subscription form" width="620" />                                    |
| Subscription details | <img src="./screenshots/modals/subscription-details.png" alt="Subscription status, account, plan, and renewal details" width="620" /> |
| Edit subscription    | <img src="./screenshots/modals/subscription-edit.png" alt="Edit subscription form" width="620" />                                     |
| Delete confirmation  | <img src="./screenshots/modals/subscription-delete-confirm.png" alt="Confirmation before deleting a subscription" width="620" />      |
| Cancel confirmation  | <img src="./screenshots/modals/subscription-cancel-confirm.png" alt="Confirmation before canceling a subscription" width="620" />     |

### Invoice dialogs

| Dialog state        | Capture                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Create invoice      | <img src="./screenshots/modals/invoice-create.png" alt="New invoice form" width="620" />                                  |
| Invalid date range  | <img src="./screenshots/modals/invoice-date-validation.png" alt="Invoice form showing due date validation" width="620" /> |
| Invoice details     | <img src="./screenshots/modals/invoice-details.png" alt="Invoice amount, customer, and due date details" width="620" />   |
| Edit invoice        | <img src="./screenshots/modals/invoice-edit.png" alt="Edit invoice form" width="620" />                                   |
| Delete confirmation | <img src="./screenshots/modals/invoice-delete-confirm.png" alt="Confirmation before deleting an invoice" width="620" />   |

## Future improvements

These are service extensions; the current browser workflows above are implemented with demo data.

- Connect to a billing API for shared team workspaces, authentication, permission levels, and server-backed records.
- Integrate a payment provider for real charges, retries, receipts, and webhook-driven payment status.
- Connect an email service for delivered invoices and payment reminders with delivery history.
- Add server-side tax rules, accounting exports, and an auditable history of billing changes.

## Links

- Portfolio: [https://www.ashishranjan.net](https://www.ashishranjan.net)
- GitHub: [https://github.com/a2rp](https://github.com/a2rp)
- CodePen: [https://codepen.io/ash1198](https://codepen.io/ash1198)
- LinkedIn: [https://www.linkedin.com/in/aashishranjan](https://www.linkedin.com/in/aashishranjan)
- Facebook: [https://www.facebook.com/theash.ashish/](https://www.facebook.com/theash.ashish/)
- YouTube: [https://www.youtube.com/@ashishranjan-ashz?sub_confirmation=1](https://www.youtube.com/@ashishranjan-ashz?sub_confirmation=1)
- Email: [mailto:ash.ranjan09@gmail.com](mailto:ash.ranjan09@gmail.com)

## Support

- Support: [https://a2rp-donation-page.netlify.app/](https://a2rp-donation-page.netlify.app/)
- Buy Me a Coffee: [https://buymeacoffee.com/ashishranjan](https://buymeacoffee.com/ashishranjan)
- Patreon: [https://www.patreon.com/ashishranjan](https://www.patreon.com/ashishranjan)
