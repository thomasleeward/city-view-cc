# Event source selection compatibility

Supports canonical contract 2026-11-11.2 and the independently gated eventSourceSelection capability. The selected source is manual or Planning Center; live provider failures do not fall back to stored manual/imported events. Manual events retain their own timezone; Planning Center uses its selected display timezone. Existing legacy standalone behavior is preserved.

Native event consumers and private previews use the selected source where applicable. Provider failures retain unrelated page and sermon content and expose an unavailable state. Per-element provider tag filters remain dormant in manual mode.

Validation: npm test passed (39 tests); production build passed; TypeScript passed for Next.js clients, and static asset/HTML checks passed for Stand Out. Regression coverage includes source/configuration validation and applicable native preview, timezone and outage behavior. Shared builder ordinary-user browser checks passed source switching, Apply/Cancel, saved dormant-filter round trip and mobile preview without horizontal overflow. No claim is made here of deployed native-client browser verification.

This change prepares frontend compatibility only. Planning owns merge/deployment, exact production receipts and final capability enablement. No hosted content, credentials, environment variables or database records were changed.
