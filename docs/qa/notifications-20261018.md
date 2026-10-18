# Notification inbox review - 2026-10-18

## Behavior

The full inbox now requests notification history explicitly. The service default
of two minutes remains suitable for dashboard popovers but previously hid older
items from both the inbox's All and Last seven days views.

Loading, read failure, empty inbox and empty filtered results have distinct UI.
Read failures expose a retry action and show unknown counts rather than zero.
Clearing filters restores the complete inbox. Changing users clears loaded rows.

A route CSS module defines light/dark colors, readable untruncated descriptions,
wrapping titles, focus outlines and responsive controls of at least 48 pixels.
The UserWorkout duration field also now matches the existing dashboard consumer,
which otherwise prevents the clean branch from passing TypeScript.

## Verified

- TypeScript passed in an isolated checkout; module CSS parsed with PostCSS.
- The clean checkout's static Hosting build passed, generating all 108 pages
  with demo Firebase build configuration; those demo artifacts were not deployed.
- Browser QA used the local checkout with this change applied, a synthetic Admin,
  and Auth/Firestore emulators for `demo-mhpersonal` only. Production data was not
  read or written by these functional tests.
- Four notices appeared: the synthetic login alert plus records aged ten minutes,
  three days and twelve days. Last seven days returned three; All returned four.
- A search without matches exposed Clear filters; clicking it restored four rows.
- At 320, 390 and 1440 pixels, in light and dark themes, document/body width did
  not exceed the viewport and search/filter/security controls measured >= 48px.
- Six local screenshots were captured under `output/playwright/notifications-*`.
  The light mobile and dark desktop captures were visually inspected.
- Temporarily denying notification reads in the demo emulator produced an error
  with unknown counts and no empty-inbox message. Restoring the original emulator
  rules and clicking Retry recovered all four notices and removed the error.
- Clicking the synthetic login alert's confirmation action displayed the resolved
  state; a separate emulator REST read confirmed `securityStatus: confirmed` was
  persisted. No password-recovery email or production security action was sent.

## Remaining scope

This is one increment of the broader Admin, Academy, Personal and Student review.
Physical-device and screen-reader verification are outstanding. Historical login
IP retention and Firestore owner/role access rules require separate work; the
inbox UI does not establish backend access isolation. This change does not alter
database rules or send notifications to real users.
