# Design system

DxPay uses one visual language across the public page, clinician terminal, provider ledger, and patient invoice. Stripe is a reference for typographic hierarchy, information density, and control discipline, not a source of branding, customer claims, or additional features.

## Foundations

- Source of truth: `frontend/src/app/globals.css`.
- Colour: white surfaces, navy text/actions, restrained orange identity accents. Status uses semantic success, warning, and destructive pairs. Raw colour values belong in the token layer, not feature components.
- Typography: Arial/Helvetica/system sans; a deliberate local stack avoids a runtime font service. App titles use 24–26px, section titles 16px, body 14px, supporting labels 12–13px. Marketing uses a larger responsive scale.
- Figures: `formatNaira` and `CurrencyAmount` use `en-NG`, NGN, thousands separators, two decimal places, and tabular figures. No dollar-denominated default.
- Spacing: 4px foundation, named spacing tokens, equal canvas gutters. Desktop sidebar is 232px; tablet and phone use the same three destinations in bottom navigation.
- Controls: shared shadcn/Radix primitives, restrained 4/6/8px corners, visible keyboard focus, hover/disabled feedback. Phone controls have 44px minimum targets.
- Data: right-aligned monetary table columns; verified payment and provider allocation are distinguished from bank settlement. Missing data is a dash, not an invented zero.

## Composition

The landing direction is “The product performs” (design seed 802000479): diagnostic services become a selectable unified bill. Its interactive example uses explicitly illustrative service prices. The provider ledger follows “Achromatic ledger” (seed 1619491291), adapted to a labelled sidebar because three clinical workflows need explicit names. There are no fabricated growth figures, customers, testimonials, or transaction charts.

The public landing and patient invoice are outside the workspace shell. `/dashboard` is the default workspace entry, with a “Create order” action to `/terminal`. `/tech` remains available but explains its missing backend integration rather than showing fabricated fulfillment.

## Accessibility and states

Preserve semantic headings, visible labels, accessible control names, keyboard operation, readable contrast, reduced-motion support, and no page-wide horizontal overflow. Public content has a skip link. Loading, empty, API failure, retry, and unavailable checkout states are explicit. Static product examples never imply successful payment.

No stock photographs or decorative video were added; working invoice fragments carry the product explanation. Motion is limited to control feedback and loading indicators, with reduced-motion overrides. These are deliberate scope and accessibility decisions rather than attempts to satisfy a marketing animation quota.
