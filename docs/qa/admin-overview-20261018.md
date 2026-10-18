# Admin overview recovery and metrics - 2026-10-18

## Changes
The Admin academy summary now treats failed queries as unavailable data rather than zero revenue or empty support/personals lists. A refresh action reloads users, monthly entries, payments, personals and tickets. The shared overview hook clears failed or unauthorized data and ignores responses from superseded requests.

Ticket summaries preserve the saved status from the shared service, use the shared status/priority normalizers, count only explicitly open tickets as open, and include unresolved critical tickets in high priority. Admin support shortcuts lead to /admin/support. Mobile and desktop section links have48px hit areas; errors have theme-aware colors and accessible alerts.

The compact /admin/dashboard now shows all five profile totals, including academies, with a responsive theme-aware card grid. Loading, failed and genuine zero values are distinct; refresh retries a failed query. Its description no longer claims revenue metrics that it does not show.

## Verified
- Isolated local Next3002 and Auth/Firestore emulators demo-mhpersonal. Existing synthetic Admin session, no production data writes.
- Added four task-specific tickets (open critical, in-progress high, resolved critical without reply, replied medium) alongside one existing resolved synthetic ticket. Browser showed5 total,1 open and2 high/critical unresolved. Task-specific records deleted after verification.
- Denied local database queries while allowing the signed-in user's own profile read. All five data families displayed accessible failure alerts and13 inspected metrics displayed unknown placeholders, without false empty lists. Original emulator rules restored in finally; refresh recovered the expected ticket counts.
- /admin/dashboard query denial showed five unknown values. Rules restored; refresh recovered totals3/0/0/1/2.
- Both routes checked at320,390 and1440px in light/dark themes, without document horizontal overflow. Summary links, actions and refresh controls measured at least48px. Screenshots in local output/playwright/admin-overview-* and admin-dashboard-*; dark mobile summary and desktop dashboard inspected visually.
- Isolated branch TypeScript and PostCSS parsing passed. No database rules deployed.

## Remaining broad QA
This is not full application certification. Main /admin summary, legacy/mixed role counting, finance value normalization and sample ordering, app error reporter persistence, public invitation server flow, production data authorization, remaining route/role workflows and physical-device checks still require review. The preview continues to include active-checkout changes outside this selective branch.
