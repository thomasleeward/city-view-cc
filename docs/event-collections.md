# Event collections — November 4, 2026

Canonical renderer revision: `2026-11-04.2`. New explicit capabilities: `featuredEvents`, `allEvents`. Setup handshake remains `2026-10-23.1`. Source support alone is not a deployed attestation; advertise only after the reviewed production deployment and shared backend are ready.

`featured_events` supports optional count 1–12 (default 3), soonest/latest-start order, plain emptyMessage and optional same-site View all action. `all_events` supports pageSize 1–24 (default 9), order and emptyMessage, with bounded Previous/Next pagination. Both require a single-column row and work in ordinary Pages and supported Screen layouts. Missing optional values remain absent. The shared publication validator requires an existing published same-site destination; there is no implicit /events route or fallback from Featured to All.

The existing theme owns collection presentation and normal same-site action rendering. Native homepage sections are unchanged.

Public widgets fetch only eligible published data with no cookies, validate responses, and never read private drafts or raw feature projections. Feature flags are independent private draft/published presentation state in the shared backend. Imported snapshots keep their explicit review/publish/archive semantics; King’s Park keeps its current live-source semantics. Finished events expire from the list without source deletion.

Verification includes canonical rejection/default tests, actual renderer Page/Screen composition, ordinary/AI round-trip checks in the shared builder, TypeScript and production build. See the shared `docs/event-collections.md` and release manifest for exact checked heads, assets, deployment order and remaining device-dependent visual checks.
