# Never86'd Catering Demand Network — implementation contract

## Commercial model
Never86'd acquires and qualifies incremental catering demand, recruits opt-in restaurants, and passes the customer to a partner's authorized checkout. Maho Cater / Cater Ordering (Ish) is the proposed primary checkout integration; DoorDash, Uber Eats, Grubhub are optional separately approved channels. Never86'd does not own dispatch, payment, merchant-of-record duties, or imply an order is booked before restaurant acceptance. Free owner seat.

## Restaurant acquisition
- Merchant applies through opt-in signup: legal/business name, contact, location/service area, catering menu URL or permissioned upload, per-person serving basis, minimum order, lead time, headcount/capacity, delivery/pickup, dietary notes, ordering platform URLs, data-reuse consent.
- State machine: applied -> verifying -> approved | declined -> paused. Only approved merchants with operator-confirmed, unexpired menus can be recommended.
- Operators edit/withdraw their own data; do not scrape Google into the master catalog. Store source rights, provenance and last-confirmed timestamps.
- Merchant approval and any price changes require authorized review. No fake restaurant listings, pricing or delivery promises.

## Buyer acquisition
- Consumer or office manager voluntarily submits city/ZIP, event date/time, guest count, food preferences, dietary constraints, budget basis, delivery/pickup and consent to share contact details.
- Lead states: submitted -> qualified -> matched -> customer_confirmed -> handed_off -> accepted | declined | expired -> fulfilled (if verified).
- Matching is eligibility-first: geography, capacity, lead time, dietary fit, total-price basis, and approved checkout. Unknowns are clearly marked and require confirmation.
- Explicit customer approval before sharing identifiable information with merchants/partners. Do not claim access to private searches or LLM conversations.

## Handoff + attribution
- Use only allowlisted partner domains or merchant-verified ordering links. Track lead ID, merchant ID, partner, campaign, click timestamp, opaque attribution token and URL version; never embed customer PII in query parameters.
- A redirect/click is NOT a conversion. Separate statuses: link_generated, clicked, checkout_started (only if reported), partner_order_verified (only with contractual webhook/report), restaurant_accepted, fulfilled.
- Signed partner callbacks require authentication, replay protection, idempotency, reconciliation and audit trail.
- No invented affiliate commissions; negotiate recurring B2B order attribution with Maho and marketplaces.

## Agent tools (proposed, not live)
search_caterers, get_catering_menu, quote_catering, request_order, get_order_status.
Read-only public tools must exclude private operator financial data. Requests and status require scoped authorization and anti-abuse controls. MCP host discovery is opt-in, not automatic.

## MVP acceptance
1. Restaurant signup persists data with consent, is pending review, cannot self-approve.
2. Buyer request persists with opt-in contact sharing and input validation.
3. Admin approves verified merchants, assigns requests, creates customer-reviewed handoffs.
4. Only approved restaurants appear; no fictitious menus or guaranteed availability.
5. Order status stays pending until restaurant acceptance; no card collection.
6. RLS/tenant isolation, server-side validation, spam protection, privacy/deletion path and audit log pass tests.
7. Test CTAP as opt-in pilot only after its operator confirms real menu and fulfillment.
8. Maho integration waits for Ish's confirmed link/API specification and commercial terms.

## Partner decisions required
Ish: checkout handoff (signed link vs API), restaurant IDs, menu ownership, acceptance events, cancellation/refunds/support, webhook auth, commission and reporting. Never86'd: lead capture, attribution, merchant acquisition and consent.
