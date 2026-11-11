# Announcement compatibility

Supports canonical2026-11-11.3 optional banner schedule and one-row/one-column popup layout containing text, image, video and button elements. Legacy fields remain dormant when layout is active; absent optional fields preserve current behavior. Banner start is inclusive and expiry exclusive, with runtime boundary/visibility updates for cached markup. Screen buttons resolve only published same-site identities through this frontend's native route; missing targets are hidden.

Validation: 41 tests passed; production build and applicable TypeScript/static HTML checks passed. Shared ordinary browser checks covered schedule draft/publish/reload, gaps/folds, exact stored offset/seconds retention, legacy conversion/reset, compact element selection from preview, stable reorder/typing, invalid-input tab/discard recovery, natural modal height, runtime boundaries and390px layout without horizontal overflow. This does not claim deployed native-client browser verification.

Planning owns review, merge, production receipts and independent feature enablement. No hosted content, source settings, credentials, environment or database mutations were made.
