## Purpose

Define how customers can customize drinks and how customization data is reflected in pricing, order submission, and order displays.

## Requirements

### Requirement: Menu cards provide customization controls
Each menu card SHALL provide optional customization controls for all drinks: extra espresso shot, milk alternative selection, and whipped cream.

#### Scenario: Controls render for each menu item
- **WHEN** the menu is displayed
- **THEN** every menu card SHALL show controls for extra shot, milk alternative, and whipped cream

#### Scenario: Milk alternatives include all supported values
- **WHEN** a customer opens the milk alternative selector
- **THEN** the selector SHALL include `none`, `oat`, `almond`, and `soy`

### Requirement: Customization selections update displayed total
The displayed order total on a menu card SHALL update immediately when customization selections change.

#### Scenario: Extra shot increases total
- **WHEN** a customer enables extra espresso shot for a medium drink priced at $5.50
- **THEN** the displayed total SHALL update to $6.25

#### Scenario: Milk alternative and whipped cream compound pricing
- **WHEN** a customer selects milk alternative and whipped cream for a small drink priced at $4.50
- **THEN** the displayed total SHALL update to $5.60

#### Scenario: Deselection restores prior total
- **WHEN** a customer deselects whipped cream after it was previously selected
- **THEN** the displayed total SHALL decrease by $0.50

### Requirement: Orders persist selected customizations
The system SHALL include selected customizations in order creation and persist them in order records.

#### Scenario: Order request includes selected options
- **WHEN** a customer places an order with extra shot enabled and milk alternative set to `oat`
- **THEN** the `POST /api/orders` payload SHALL include `customizations` with those selected values

#### Scenario: Order response contains saved customizations
- **WHEN** the backend returns a newly created order
- **THEN** the order SHALL include the saved `customizations` values and the total that includes customization charges

### Requirement: Order views show customization details
Order queue and status board views SHALL display selected customizations for each order.

#### Scenario: Selected options are listed in active order display
- **WHEN** an active order includes extra shot and soy milk
- **THEN** the order display SHALL show both selected options in a human-readable summary

#### Scenario: No selected options omits customization summary
- **WHEN** an order has no selected customizations
- **THEN** the order display SHALL omit the customization summary line
