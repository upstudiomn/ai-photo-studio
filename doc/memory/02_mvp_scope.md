# MVP Scope

## MVP goal

Build a working preview-first ecommerce flow:

```text
User uploads photo
→ chooses template/style
→ AI preview is generated
→ user views results
→ user chooses digital/print/both
→ checkout creates confirmed order
→ admin fulfills order
```

Do not create confirmed orders before AI preview/results exist.

## Current MVP status

Implemented and tested:

- Public flow from upload to order detail in local mode.
- Real browser UI flow from home CTA through upload, template selection, explicit preview generation, results, checkout, and order detail.
- Generation sessions, uploaded images, generated outputs, orders, order items, payments, and print jobs in local PostgreSQL.
- Local file uploads and mock generated preview storage.
- Playwright browser E2E for preview-first flow.
- Playwright browser E2E for signup, admin auth blocking, and authorized admin UI actions.

Implemented but not fully production-tested:

- Supabase database/storage runtime path.
- Replicate provider live output path.
- Admin status updates, notes, print queue, and template prompt editor.

Planned/risk:

- Verify production admin setup/browser smoke again in the final production environment before launch.
- QPay integration.
- Persisted review approval/rejection workflow.
- Real AI quality validation on sellable templates.

## MVP must include

### Public pages

- Home page
- Template gallery
- Template detail page
- Upload/create page
- Template/style selection page
- Generation processing page
- Results page
- Checkout page
- Confirmed order status page

### User features

- Upload 1-5 images
- Select AI template/style
- Add simple instructions
- Create generation session
- See processing status
- View preview images
- Choose digital or print option after preview
- Create confirmed order after checkout/product decision
- Submit delivery details if print is selected

### Admin features

- View confirmed orders
- View generation session source images
- View generated outputs
- Update order status
- Review generated outputs; persisted approve/reject remains planned
- Mark order as printing, packed, delivered

## MVP templates

Start with 5 safer templates:

1. Old photo restoration
2. Black and white colorization
3. Scratch and damage removal
4. AI studio portrait
5. Product photo background upgrade

## Beta templates with admin review

- Family merge
- Couple cinematic portrait
- Kids storybook poster
- Pet portrait

## Not in MVP

- Fully automated QPay if time is short
- Complex face consistency pipeline
- Full print file automation
- Advanced user account dashboard
- Multi-language support
- Mobile app
- Subscription system
- Template marketplace

## MVP principle

Build the smallest system that proves:

1. Users can upload photos
2. AI can generate useful previews
3. Users choose products after preview results
4. Admin can manage confirmed orders
5. The business can sell digital or print products
