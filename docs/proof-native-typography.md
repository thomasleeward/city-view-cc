# Proof native typography — November 2, 2026

Canonical shared contract: `2026-11-02.1`. Optional Text `textStyle` values: `body`, `eyebrow`, `heading`, `hero_heading`; absent remains Body. Native presets use this frontend's scoped `--proof-heading-*`, `--proof-eyebrow-*` and section accent hooks. Body follows the existing renderer unchanged. Native rendering overrides stored font size/family and italic heading color without modifying the canonical rich-text source; selecting Body restores manual formatting. Paragraph boundaries in native text become hard breaks, rendered with phrasing-safe markup.

Optional Accordion `labelStyle`: `default` or `heading` (native H3 metrics). Native disclosure and keyboard behavior remain intact.

Preview pencils carry the original canonical text and an optional style under the existing source/origin/site/document checks. Native style editing requires the parent capability boolean. Production reads remain published-only. No client content, credentials, environment, dependencies or databases changed.

Verification: required existing typecheck/test/build commands pass, including native typography SSR/validation/preservation coverage. Shared ordinary editor and synthetic AI create → ordinary edit/save/reload → AI Body reset acceptance are recorded in Proof Admin's typography handoff. King's Park's actual frontend was additionally compared against its native headings and eyebrow at desktop and 390px: same computed metrics, two-line heading height, section accent and no horizontal overflow. The temporary synthetic comparison route was removed before final checks.

Release order: merge and verify this exact production frontend READY before Proof Admin advertises `textSemanticStyles` and `accordionLabelTypography`. Prior Screen, Map, sermon, cards and client skin capabilities are preserved.
