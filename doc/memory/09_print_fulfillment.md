# Print Fulfillment

## Current implementation status

- Print jobs are created only after checkout for product choices that include print.
- `/admin/print-queue` reads current print jobs.
- Print fulfillment is still manual MVP operations.
- Automated vendor routing, print-ready file generation, delivery integration, and SLA tooling remain planned.

## Print business role
AI Photo Studio must sell not only digital images but premium printed photo gifts.

## Print products
| Product | Size | Notes |
|---|---|---|
| A4 photo print | 21 × 29.7 cm | Starter product |
| A3 photo print | 29.7 × 42 cm | Main premium poster |
| A3+ print | optional | For trimming or premium |
| Framed A4 | optional | Gift product |
| Framed A3 | optional | Premium gift |
| Metal print | later | Outsource or local supplier |

## Print file requirements
- 300 DPI target
- A4: 2480 × 3508 px
- A3: 3508 × 4961 px
- sRGB for MVP
- No watermark on final file
- Add 3 mm bleed where needed
- Keep important faces away from trim edges

## Print workflow
```text
Order paid
→ Admin quality check
→ Generate final print file
→ Download print file
→ Print locally
→ Trim
→ Package
→ Deliver
→ Mark delivered
```

## Paper direction
Start with:
- Matte photo paper
- Satin/lustre photo paper
- Coated art paper for posters

Avoid overcomplicating paper choices in MVP.

## Delivery
MVP options:
- Pickup
- Ulaanbaatar delivery
- Manual delivery fee

Later:
- Automated courier integration
- Delivery tracking
