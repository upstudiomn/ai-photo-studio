# AI Photo Studio UX/UI & Branding Guide

## Current language and UI status

- Visible customer/admin UI copy is English and should stay professional global SaaS/ecommerce English until a localization task explicitly changes it.
- Mongolian copy can remain in docs/internal localization notes and seed fields.
- Internal `titleMn`/`descriptionMn` fields may remain, but UI should prefer English fields or English fallbacks.
- Public and admin shadcn/Radix UI polish is implemented; future UI work should be incremental and must preserve preview-first flow.

## Final master style

Use Option A: Modern Sage Premium.

The website should feel:

- modern
- clean
- premium
- warm
- trustworthy
- photo gift focused
- family memory focused
- local Mongolia ecommerce friendly

It must NOT feel like:

- dark AI dashboard
- neon tech tool
- cheap template website
- old brown/gold luxury
- childish pastel design
- complicated prompt generator

## UI component foundation

Preferred UI layer:

- Use shadcn/ui-style primitives in `components/ui`.
- Use Radix UI primitives through shadcn-style wrappers for accessible menus, dialogs, sheets, selects, labels, avatars, and separators.
- Use `lucide-react` as the icon system.
- Keep Tailwind CSS as the styling base.
- Keep Modern Sage Premium tokens as the source of truth for color, radius, borders, focus states, and shadows.
- Existing pages should migrate gradually to shared shadcn-style primitives instead of being redesigned all at once.

Current public migration notes:

- `/create`, `/templates`, `/templates/[slug]`, `/results/[sessionId]`, and `/checkout/[sessionId]` now use shadcn-style `Card`, `Button`, `Badge`, `Label`, `Input`, and `Textarea` primitives where appropriate.
- Product choice, template card, preview output, and checkout summary surfaces should continue migrating through shared public components instead of one-off card/button styles.
- Preview-first UX remains unchanged: results/product selection happens before checkout, and confirmed orders are created only after checkout confirmation.
- Remaining polish should be incremental and should not rewrite admin pages or payment/provider logic.

Current admin migration notes:

- Admin pages now use shared shadcn-style Table, Select, Card, Badge, Button, Textarea, and Label primitives where appropriate.
- Status controls use Radix/shadcn Select while preserving the existing admin update API behavior.
- Admin notes use shadcn Textarea/Button/Card and keep the existing note save behavior.
- Review queue remains a read-only MVP quality workspace until persisted approval/rejection is implemented.

Current foundation components:

- button
- card
- input
- label
- textarea
- dropdown-menu
- avatar
- badge
- separator
- dialog
- sheet
- table
- select

## Font

Use Manrope as the main font.

Implementation direction:

- Use `next/font/google`
- Font family: Manrope
- Use it for headings, body, buttons, forms, cards, admin UI, and navigation.
- Use strong font weights for headings and CTAs.
- Keep visible English UI clean, professional, and ecommerce-friendly.

Suggested font usage:

- Hero heading: 700-800
- Section heading: 700
- Card title: 700
- Body text: 400-500
- Button: 700
- Small label/badge: 600

## Final color palette

Use this palette as the master design system:

- Background: `#F7F8F3`
- Card: `#FFFFFF`
- Primary text: `#151716`
- Secondary text: `#7A8178`
- Primary accent: `#6F8F72`
- Accent dark: `#4F6F52`
- Soft accent: `#E7EFE4`
- Border: `#E2E7DE`
- Button text: `#FFFFFF`

Additional neutral colors:

- Muted surface: `#F1F4EE`
- Soft shadow: `rgba(21, 23, 22, 0.08)`
- Danger: `#C84646`
- Warning: `#C76A2A`
- Success: `#2F8F5B`

## Button style

Primary button:

- Background: `#6F8F72`
- Hover: `#4F6F52`
- Text: `#FFFFFF`
- Border radius: 12px-16px
- Padding: comfortable ecommerce CTA size
- Font weight: 700

Secondary button:

- White or transparent background
- Border: `#E2E7DE`
- Text: `#151716`
- Hover background: `#E7EFE4`

Avoid brown/gold buttons completely.

## Card style

Cards should be:

- White background
- 20px-24px border radius
- Subtle border using `#E2E7DE`
- Soft shadow only
- Large photo preview area
- Clean spacing
- Not too crowded

## Layout style

Use:

- Large whitespace
- Clean ecommerce grid
- Big visual photo previews
- Simple 4-step user flow
- Mobile-first responsive layout
- Sticky CTA where useful
- Clear order status timeline

## Header/account UX

Use a compact premium header:

- Left: logo mark + `AI Photo Studio`
- Center: main navigation
- Right: primary CTA `Upload photo` plus one account icon/avatar dropdown
- Do not show separate standalone `Log in` and `Sign up` buttons in the global header.

Account dropdown direction:

- Use shadcn/ui DropdownMenu, Avatar/Button style primitives, Radix UI, lucide-react icons, and Tailwind.
- Logged-out menu: `Log in`, `Sign up`, optional `Upload photo`.
- Logged-in menu: `Account`, `Settings`, `Log out`.
- Keep the dropdown white/sage, rounded, softly shadowed, and right-aligned.

## Homepage structure

Homepage should include:

1. Header with logo, nav, CTA
2. Hero section
3. Before/after photo comparison
4. Trust badges
5. Main service cards
6. How it works section
7. Print product section
8. Privacy/trust section
9. Final CTA
10. Footer

Hero copy:

> Restore photos. Create memories. Order premium prints.

Subcopy:

> Restore old photos, colorize memories, create AI portraits, and order A4/A3 prints with delivery.

Primary CTA:

> Upload photo

Secondary CTA:

> Browse templates

## Main UX flow

The whole site should make this flow obvious:

1. Upload photo
2. Choose template
3. View AI preview
4. Download or order prints

## Template card design

Each template card should include:

- Large image preview
- Category badge
- Template title
- Short English description
- Required photo count
- Starting price
- Admin review badge if required
- CTA button: `Start`

Example:

- Title: `Old Photo Restoration`
- Description: `Clean scratches, stains, and faded details for a print-ready result.`
- Price: `From 15,000₮`
- CTA: `Start`

## Upload page UX

Create/upload page layout:

- Main area: large upload dropzone
- Template/style selector after upload, or selected template summary when arriving from a template detail page
- Customer note field
- Consent checkbox
- Clear CTA button: `Generate preview`

Trust copy:

> Your photo is used only to create your preview and process a confirmed order.

Consent:

> I have the right to use this photo and consent to AI processing for my preview/order.

## Order status UX

Order page should feel like delivery tracking only after checkout/product decision creates a confirmed order.

Before checkout, use generation session/results pages for upload, AI processing, and preview results.

Statuses:

- Uploaded
- AI processing
- Preview ready
- Waiting approval
- Paid
- Print ready
- Printing
- Packed
- Out for delivery
- Delivered
- Revision requested

Use sage accent for active status.
Use soft accent backgrounds for completed steps.
Keep the page clean and reassuring.

## Admin dashboard UX

Admin UI should be clean and practical.

Use:

- Left sidebar
- Order table
- Status filters
- Order detail page
- Uploaded images
- Generated previews
- Quality checklist
- Status update buttons
- Admin notes

Admin does not need heavy decoration. It must be fast and clear.

Quality checklist:

- Face identity preserved?
- Eyes, teeth, hands normal?
- No unwanted text/logo?
- Print resolution OK?
- Customer request followed?
- Background realistic?
- Skin tone natural?

## Badges and states

Use sage system colors:

- Active/selected: `#6F8F72`
- Soft selected background: `#E7EFE4`
- Border: `#E2E7DE`
- Text: `#151716`

Admin review badge:

- Soft accent background
- Sage text
- Small rounded pill

Warning badge:

- Warm muted orange

Error badge:

- Muted red

## Image style

Use photography that feels:

- warm
- natural
- clean
- emotional
- family-oriented
- premium print focused

Avoid:

- robot images
- cyberpunk
- neon AI graphics
- fake futuristic dashboards
- dark sci-fi style

## Logo direction

Logo is minimal and premium:
- Camera icon with soft shadow
- Square rounded frame
- Modern sage green background
- Consistent across all pages

## Copywriting tone

English UI text should be:

- simple
- trustworthy
- warm
- not too technical
- ecommerce-friendly
- family/gift oriented

Use words like:

- memory
- restore
- print
- gift
- premium
- delivery
- private photo protection

Avoid overly technical AI words on customer-facing pages.

## Design do / don't

Do:

- Use Manrope
- Use Modern Sage Premium colors
- Use large previews
- Use clean white cards
- Use clear CTA buttons
- Use simple English copy
- Use privacy/trust messages
- Use mobile-first layouts

Don't:

- Use brown/gold as primary color
- Use dark dashboard UI
- Use neon gradients
- Make it look like a prompt generator
- Overload pages with too many options
- Use robot/AI cliché visuals
- Auto-deliver face-sensitive orders without admin review
