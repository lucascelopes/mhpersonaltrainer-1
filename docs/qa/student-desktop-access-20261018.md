# Student access and home theme QA - 2026-10-18

## Corrections
- Removed viewport-based access restrictions from student login, registration, invitation and AuthGate. Role handling and authentication checks remain in place.
- Student registration/login text now describes desktop and mobile. Existing active-checkout field autocomplete, validation feedback and Portuguese corrections are captured in this narrow branch.
- Invitation email validation no longer expects literal backslashes. Invitation codes must be positive safe integers. Changing code clears the previous personal; asynchronous lookup ignores stale responses.
- Invitation lookup opts into errors from the shared service, displays a retry action, and disables registration until a personal is confirmed. Other shared-service callers preserve their previous null-on-error behavior.
- Student home dark theme now uses themed hero/card/tile surfaces. Colored function icons remain distinguishable, navigation and inline actions are at least48px and keyboard focus is visible.

## Evidence
Local Next QA at127.0.0.1:3002 with Auth/Firestore emulators only, project demo-mhpersonal. No production signup, messages or data mutations.
- Existing synthetic student signed in at1440px through /login-aluno and reached the rendered /app dashboard with Perfil: Aluno.
- A new synthetic student registered through /register-aluno at1440px. Empty-name and password-mismatch validations passed first. Independent emulator REST read confirmed persisted display name, professorAccount=false and admin=false.
- Home browser checks at320,390 and1440px in both themes: no document horizontal overflow, sampled title/function/feature text contrast >=13.56:1 against the opaque underlying surface; inline actions and hero controls48px. Hero gradient is not included in the numerical background calculation; screenshots independently inspected.
- Invalid invitation code atdesktop shows an explicit error and disables submit. With a numeric code, unauthenticated Firestore denial displays a loading failure and offers retry; retry was exercised and remained disabled after failure.
- TypeScript and PostCSS parse passed. Production static build exported108 pages.

## Still open
The existing public invitation flow queries private users before authentication and is denied by the current database rules. This task does not make linked invitation registration functional. A server-owned invitation/registration flow and its end-to-end tests are required; broad unauthenticated reads must not be enabled. Full role/route QA, production security rules and physical-device tests remain open.

