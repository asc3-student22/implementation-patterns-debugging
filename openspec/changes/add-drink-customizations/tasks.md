## 1. Backend Customization Model And Pricing

- [x] 1.1 Extend order request/response models to include optional `customizations` fields with defaults (`extra_shot`, `milk_alternative`, `whipped_cream`)
- [x] 1.2 Add backend customization price constants and compute final order total as base size price plus selected customization charges
- [x] 1.3 Update order creation service flow to persist customization selections on each in-memory order record
- [x] 1.4 Verify `POST /api/orders` remains backward-compatible when `customizations` is omitted

## 2. Menu Card Customization UI

- [x] 2.1 Add customization controls to each menu card (extra shot toggle, milk alternative selector, whipped cream toggle)
- [x] 2.2 Extend per-card frontend state to track selected size and customization values together
- [x] 2.3 Implement dynamic order button total recalculation for all customization and size changes
- [x] 2.4 Include selected customizations in order placement payloads sent to `POST /api/orders`

## 3. Order Queue And Status Display Updates

- [x] 3.1 Add frontend formatter to render selected customizations as a compact, human-readable summary
- [x] 3.2 Update active order rendering to display customization summaries when options are selected
- [x] 3.3 Update completed/status board rendering to display customization summaries using the same format
- [x] 3.4 Ensure orders with no selected customizations do not render an empty customization line

## 4. Validation And Regression Checks

- [x] 4.1 Manually verify pricing math for representative combinations (size-only, single option, multiple options)
- [x] 4.2 Manually verify backend responses and queue/status displays preserve selected customization data
- [x] 4.3 Confirm no behavior regressions for existing size selection and order status progression flows
