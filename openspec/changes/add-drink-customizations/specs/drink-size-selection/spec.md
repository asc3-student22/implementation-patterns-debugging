## MODIFIED Requirements

### Requirement: Order button reflects selected size and total price
The order button on each menu card SHALL display the currently selected size and the full computed price, including selected customizations.

#### Scenario: Order button shows size-only total by default
- **WHEN** a menu card first renders with medium selected and no customizations
- **THEN** the order button text SHALL show the medium base price

#### Scenario: Order button updates when customizations change
- **WHEN** the customer enables extra shot on a card with large size selected
- **THEN** the order button text SHALL update to show the large base price plus $0.75

#### Scenario: Order button updates for milk alternative
- **WHEN** the customer selects `almond` milk on a card
- **THEN** the order button text SHALL include an additional $0.60 in the displayed total

### Requirement: Order is placed with selected size and customizations
When the customer clicks the order button, the system SHALL send both the selected size and selected customizations to the API.

#### Scenario: Placing a customized small order
- **WHEN** the customer selects `small` and enables whipped cream for "Deep Learning Doppio" and clicks order
- **THEN** the system SHALL send `POST /api/orders` with `{ "item_id": "deep-doppio", "size": "small", "customizations": { "extra_shot": false, "milk_alternative": "none", "whipped_cream": true } }`
- **THEN** the order queue SHALL show "Small Deep Learning Doppio" with a total that includes the whipped cream charge

#### Scenario: Placing a fully customized large order
- **WHEN** the customer selects `large`, enables extra shot, selects `soy` milk, and enables whipped cream on "Transformer Flat White"
- **THEN** the system SHALL send `POST /api/orders` including all selected customization fields
- **THEN** the created order total SHALL equal base large price plus $0.75, $0.60, and $0.50
