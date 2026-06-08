## Context

BeanBotics currently supports drink selection by size and a status-driven order queue, but it does not support optional add-ons. The frontend computes button text from selected size, and the backend computes totals from base size price only. This change introduces customization state in the menu UI, extends order creation payloads, and ensures customization details are visible in queue/status views while preserving the current in-memory order model and service-layer architecture.

## Goals / Non-Goals

**Goals:**
- Add three optional extras for all drinks: espresso shot, milk alternative choice, and whipped cream.
- Recompute and display order totals dynamically on each menu card as customization selections change.
- Persist customization selections in created orders and include their price impact in server-side totals.
- Render customization details consistently in active/completed order displays.
- Keep API and implementation simple for the current in-memory architecture.

**Non-Goals:**
- Per-drink customization availability or restriction rules.
- Inventory tracking for extras.
- Saved profiles, recurring preferences, or account-level defaults.
- Introducing a database or additional backend infrastructure.

## Decisions

1. Customization payload shape
- Decision: `POST /api/orders` accepts a `customizations` object with explicit keys:
  - `extra_shot` (boolean)
  - `milk_alternative` (`none` | `oat` | `almond` | `soy`)
  - `whipped_cream` (boolean)
- Rationale: Explicit fields keep validation straightforward in FastAPI/Pydantic and avoid ambiguous free-form arrays.
- Alternative considered: array of option IDs (rejected because it adds mapping/normalization complexity across frontend and backend).

2. Price calculation authority
- Decision: Backend remains the source of truth for final pricing; frontend performs mirrored calculation only for display.
- Rationale: Prevents client-side price tampering and keeps API responses canonical.
- Alternative considered: frontend-only calculation (rejected due to integrity risk and potential drift).

3. Frontend state model
- Decision: Keep per-card ephemeral selection state in existing vanilla JS rendering flow, extending size state with customization fields.
- Rationale: Minimal change footprint and no framework/state library dependency.
- Alternative considered: centralized global state store (rejected as unnecessary complexity for current app size).

4. Order display representation
- Decision: Add a compact, human-readable customizations summary line on order cards (queue + status board), omitting the line when no options are selected.
- Rationale: Preserves scanability while ensuring fulfillment details are visible.
- Alternative considered: raw JSON/object rendering (rejected as unreadable for operators).

## Risks / Trade-offs

- [Frontend/backend pricing drift] -> Mitigation: define customization constants once and verify totals via backend response in UI refresh.
- [Payload backward compatibility issues] -> Mitigation: make `customizations` optional with defaults equivalent to no extras.
- [UI clutter on small screens] -> Mitigation: use grouped, compact controls and concise labels with responsive stacking.
- [Future option expansion requiring code edits in multiple files] -> Mitigation: isolate option config/constants for easier extension.

## Migration Plan

- Deploy backend support first with optional `customizations` payload handling and default behavior for old clients.
- Deploy frontend customization controls and dynamic total updates.
- Validate end-to-end by placing orders with each option combination and confirming queue/status display.
- Rollback strategy: revert frontend controls first; backend remains backward-compatible with legacy payloads.

## Open Questions

- Should order displays include per-option line-item pricing or only selected option labels and total?
- Should milk alternative choice be required to clear automatically when toggling away from non-default state via a dedicated reset control?
