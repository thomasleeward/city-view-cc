# Editable timed Page redirects

Compatible with Proof Admin canonical contract `2026-11-17.1`. Ordinary Pages may store optional `timedRedirect: {enabled, destination: {kind: "page" | "url", value}, delaySeconds}`. The shared builder provides the controls; the frontend does not hardcode thank-you copy, destinations or delays. Default delay is 10 seconds (1–300), and absence/disabled settings leave prior behavior unchanged. Link Pages, blog posts and Screens are excluded as sources.

Public routes explicitly opt into the shared countdown runtime and resolve typed page UUIDs from same-site published snapshots. External destinations use HTTPS without credentials. Continue is an ordinary SSR link; JavaScript adds the countdown and cancellation. Automatic navigation replaces history. Timers/listeners clean up on navigation, and private preview routes never opt in. Redirect destination drafts are excluded from private preview dependencies.

The portable runtime and CSS match the reviewed shared source. Client skins may override `--proof-redirect-background` and `--proof-redirect-color`; content and settings remain in the common builder. No database migration, environment changes, credentials, new permissions or client content publication is part of this update.

Planning enables the per-site capability only after verifying this repository's exact production deployment. Local adapter checks cover persisted canonical values, destination resolution and explicit public versus inert preview behavior. The City View actual renderer and shared normal editor were also checked with synthetic local content. Hosted client pages were not changed for testing.
