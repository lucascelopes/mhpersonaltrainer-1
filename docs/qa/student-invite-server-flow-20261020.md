# Student invite flow QA — 2026-10-20

## Change

The invitation page now resolves a Personal through callable Functions rather than an unauthenticated Firestore query. New students are created and linked on the server. Students who already have an account can sign in, return to the invitation, and link their account. The server checks the free-plan limit inside a Firestore transaction and serializes roster changes through the Personal document.

## Local verification

- `web-next` TypeScript check and JavaScript syntax checks passed.
- Used Firebase Auth, Firestore, and Functions emulators under `demo-mhpersonal`. Temporary owner-only Firestore rules reproduced the old unauthenticated lookup failure and showed the new invitation preview working. No production account was used.
- New-account journey created one Auth user and one linked `users` document, then entered `/app`.
- With four linked students, another registration returned `RESOURCE_EXHAUSTED` and did not create an Auth user.
- Two concurrent registrations competing for one remaining slot produced one success and one `RESOURCE_EXHAUSTED`; the final linked count was four.
- Existing-account journey returned from `/login-aluno` to the invitation, linked the existing student, and reached `/app`. Reopening the invitation showed the already-linked state.
- Unauthenticated claim returned 401. At capacity, an existing student claim returned 429 without changing its document. A Personal account claim returned 403 without changing its document.
- A duplicate email, a missing or invalid code, and an `@admin.com` signup were rejected.
- Invitation layout was inspected at 320 px, 390 px, and 1440 px. The 320 px existing-account screen had no horizontal overflow and its return link measured 48 px high.

## Scope and remaining risk

- These are local emulator checks with synthetic accounts. They do not prove live signup, email delivery, or real subscription behavior.
- The repository's current `firestore.rules` still permits all authenticated reads and writes. This change does not close that broader authorization gap; production rules need a separate migration and regression review.

## Firebase review publication

- Created only `previewPersonalInvite`, `registerStudentWithInvite`, and `claimPersonalInvite` in `profissions-2746d`, region `southamerica-east1`; the CLI reported successful creation for each and the subsequent function listing contained all three.
- Published Hosting review channel `revisao-20261018` as version `c2e211bf23809eea`, expiring 2026-10-27. The main Hosting channel was not updated.
- External HTTP returned 200 for `/login`, `/invite`, `/admin`, `/app`, and sampled JavaScript assets. The live preview function returned 400 for malformed code `0`. In a browser, a nonexistent invite code displayed `Personal não encontrado.` and disabled account creation.
- Visually inspected the published login at 320 and 390 px. Its logo is visible with dark contrast, and there is no horizontal overflow at 320, 390, 768, or 1440 px.
- No real production account or invitation was used to exercise live signup or linking.
