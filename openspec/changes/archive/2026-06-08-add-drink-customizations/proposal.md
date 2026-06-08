## Why

Customers currently cannot customize drinks with common add-ons, which limits ordering flexibility and creates a mismatch with expected coffee shop behavior. Adding customization options now improves user experience and order clarity while the menu and status-board flows are still lightweight and easy to extend.

## What Changes

- Add optional drink customizations for every menu item: extra espresso shot (+$0.75), milk alternative (oat/almond/soy, +$0.60), and whipped cream (+$0.50).
- Display customization controls on each menu card and keep the order button total synchronized with selected options.
- Include selected customizations in order creation payloads and server-side order totals.
- Show selected customizations in both the order queue and status board displays.
- Keep all customization options globally available for all drinks; no per-drink rules.
- Exclude inventory tracking and recurring/saved preference features from this change.

## Capabilities

### New Capabilities
- `drink-customizations`: Optional add-ons that customers can select per drink, with dynamic total calculation and end-to-end display in order flows.

### Modified Capabilities
- `drink-size-selection`: Order button pricing behavior changes from size-only pricing to size-plus-customizations pricing.
- `order-status-ui`: Order cards/rows now include customization details when rendering active and completed orders.

## Impact

- Frontend UI logic in `frontend/script.js` for menu card rendering, selection state, and total recomputation.
- Frontend layout/styling in `frontend/index.html` and `frontend/style.css` for customization controls and order detail display.
- Backend request/response models and order handling in `backend/models.py`, `backend/app.py`, and `backend/services/orders.py`.
- API contract extension for `POST /api/orders` to accept selected customization options and return them in order data.
