# ShopLedger

## Stack

- Node.js application using Express and `body-parser`.
- Static browser UI: HTML, vanilla JavaScript, and CSS in `public/`.
- Persistence: one JSON file, `data/db.json`.

## Module map

- `routes/products.js` — product catalog and coupon endpoints.
- `routes/orders.js` — order listing, placement, retrieval, and cancellation endpoints.
- `routes/customers.js` — customer and Khata-settlement endpoints.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and export endpoints.
- `lib/coupons.js` — coupon normalization, validation, calculation, and listing.
- `lib/dates.js` — current-date, date-key normalization, and fiscal-year utilities.
- `lib/inventory.js` — product lookup, sellable-stock calculation, stock checks, reserve/release, and summaries.
- `lib/invoice.js` — invoice figures and printable HTML rendering.
- `lib/ledger.js` — customer lookup, balances, Khata charges/reversals, and settlements.
- `lib/orders.js` — order creation, lookup, cancellation, and filtering.
- `lib/pricing.js` — subtotal, discount, and order-total calculations.
- `lib/reports.js` — dashboard and GST-reconciliation calculations.
- `lib/store.js` — JSON database read/write and audit-log append operations.
- `lib/tax.js` — GST-rate lookup and CGST/SGST split calculations.

## Commands

- Start the app: `node server.js` (also `npm start`).
- Run Node tests: `node --test`.

## Rules

1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket

Cannot sell the last sellable unit in stock, and cancelling an order never restores stock.

Allowed files: `lib/inventory.js`, and `lib/orders.js` (cancel only).
