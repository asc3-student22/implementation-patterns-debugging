## ADDED Requirements

### Requirement: Order cards show customization summary
Each rendered order card in the status UI SHALL display selected customization options in a readable summary when options are present.

#### Scenario: Active order shows customizations
- **WHEN** an active order has `extra_shot=true`, `milk_alternative="oat"`, and `whipped_cream=false`
- **THEN** the order card SHALL display a customization summary including "Extra shot" and "Oat milk"

#### Scenario: Completed order shows customizations
- **WHEN** a completed order includes any selected customization options
- **THEN** the completed order card SHALL display the same customization summary format as active orders

#### Scenario: Orders with no customizations omit summary
- **WHEN** an order has no selected customization options
- **THEN** the status UI SHALL not render a customization summary line for that order
