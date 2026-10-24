# Editable accordion element

The shared Proof Admin layout element is `accordion`: stable element ID, 1–20 items with unique stable IDs, plain titles (1–200 characters), existing formatted-text bodies, `allowMultiple` and `openFirst` (both false by default). It works in every layout column, including multi-column rows and Screen layouts. No new database, credentials or client content is required.

The default uses native `details`/`summary`, keyboard controls, a plus/minus indicator, inherited fonts/colors, and a bottom border. Exclusive native disclosure names are unique per rendered instance. The preview selects the element while preserving the summary's native opening behavior. Item text is edited with the same shared inspector for every client.

## Client presentation

Customize the frontend's scoped `.proof-accordion`, `.proof-accordion-item`, `.proof-accordion-summary`, `.proof-accordion-icon`, and `.proof-accordion-body` hooks or override these CSS variables in the client theme:

- `--proof-accordion-color`, `--proof-accordion-border`, `--proof-accordion-background`
- `--proof-accordion-radius`, `--proof-accordion-spacing`
- `--proof-accordion-summary-padding`, `--proof-accordion-body-padding`, `--proof-accordion-font-weight`

Keep the canonical content shape and accessible disclosure behavior. Use the same client component/skin for public output and private preview. A custom appearance does not need a different backend or stored HTML/code.

## Verification and release

Layout tests cover multi-column use, bounded items, default behavior, formatted bodies, unique nested IDs and rejection of arbitrary fields. TypeScript/build checks apply to Next.js clients; Stand Out additionally checks HTML/assets and actual native markup/security. Planning's synthetic browser acceptance checks Enter/Space, exclusive/multiple/first-open behavior, isolation between instances and an independent client skin. The shared builder performs the ordinary-editor and AI round trip.

Deploy this compatible renderer before enabling accordion for the client in Proof Admin's reviewed renderer registry. Source changes alone are not a deployed capability. Public loading still reads only this client's published snapshots.
