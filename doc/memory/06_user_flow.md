# User Flow

## Main user journey

AI Photo Studio uses preview-first flow.

```text
Home
→ Upload photo
→ Choose template/style
→ Click generate AI preview
→ View results
→ Choose digital download or print product
→ Checkout
→ Confirmed order
→ Admin fulfillment
```

Key rule:
The early stage is a generation session, not a confirmed order.

Do not create a confirmed order before AI preview/results exist.

## Current implementation status

- Local browser E2E verifies the preview-first flow from home CTA and `/create` to `/orders/[orderId]`.
- Real browser E2E verifies upload, template selection, explicit preview generation, results, checkout, and order detail through visible UI.
- `/create` creates a generation session and uploaded image.
- `/create/template` selects a template/style before generation.
- `/generate/[sessionId]` waits for the user to click `Generate preview`; it does not create outputs on page load.
- `/results/[sessionId]` shows preview results and product choices.
- `/checkout/[sessionId]` creates confirmed order records only after checkout submit.
- `/orders/[orderId]` is for confirmed orders only.
- Visible UI copy is English; Mongolian/internal template fields may remain as data.
- Real user flows do not silently fall back to `demo-session-001` or `demo-order-001` when a real session/order is missing.

## Customer-facing wording

Use before checkout:

- Generate preview
- Processing your photo
- View results
- Confirm selection

Use only after the user has selected digital/print:

- Confirm checkout

## Preferred routes

```text
/create
/create/template
/generate/[sessionId]
/results/[sessionId]
/checkout/[sessionId]
/orders/[orderId]
/templates
/templates/[slug]
```

`/templates` and `/templates/[slug]` are browse/education pages.

Template detail CTA:

> Start with this template

## Create / upload flow

Fields:

- Upload image/images
- Customer note
- Consent checkbox

Consent text:

> I have the right to use this photo and consent to AI processing for my preview/order.

## Generation session flow

Statuses:

- draft
- uploaded
- template_selected
- generating
- preview_ready
- failed
- converted_to_order

## Results UX

- Show 2-4 generated previews.
- Apply watermark on previews.
- Allow customer to select favorite.
- Customer chooses digital file, A4 print, A3 print, or digital + print after seeing preview.
- Full-resolution file only after payment or admin approval.

## Checkout flow

Checkout happens from a generation session, after preview results exist.

Checkout collects:

- selected output
- product choice
- customer contact
- delivery address if print is selected
- payment intent/manual payment state

## Confirmed order tracking

`/orders/[orderId]` is only for confirmed orders after checkout/product decision.

Order statuses:

- pending_payment
- paid
- print_ready
- printing
- packed
- out_for_delivery
- delivered
- revision_requested

## Print flow

If user chooses print:

- Select size: A4/A3
- Select paper: matte/satin/lustre
- Add delivery address
- Add phone number
- Confirm order
- Create print job
