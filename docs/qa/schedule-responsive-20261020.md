# Agenda responsive QA — 2026-10-20

## Change

The schedule page uses the existing locally developed desktop/mobile calendar design and keeps the appointment, workout, and evaluation data sources. Mobile calendar controls and day cells now have 44 px touch targets. The week header and month grid scroll within the calendar at 320 px without widening the page. Agenda cards show service and Personal details to a student, or student and service details to a Personal. The appointment detail page clears stale loading errors and changes the displayed status only after a successful write.

## Local verification

- TypeScript check passed against the root QA checkout after the calendar changes. A complete Hosting export built all 108 routes successfully.
- Rendered an authenticated synthetic student and Personal against Firebase Auth and Firestore emulators. Inspected the schedule at 320, 390, 768, and 1440 px with no page-level horizontal overflow.
- At 320 px, navigation/filter controls, filter choices, week day buttons, and month day buttons measured at least 44 px in each touch dimension. The week header scrolls independently while the selected day's timeline retains the page width.
- Selected the last day of the week by touch; the header scrolled into view and the day panel updated. Toggled month/week view and opened the filter choices.
- Seeded two overlapping synthetic appointments on 2026-10-21. The schedule showed two commitments, one training and one evaluation; the selected-day panel displayed their times and links. The student saw service and Personal context; the Personal saw student and service context.
- Followed a commitment to its details. The initial false “Usuário não encontrado” alert did not appear after the fix. Cancel and confirm both updated the status, and confirmed status persisted after reload.
- Under a temporary emulator rule denying writes, a failed cancellation left the previous status unchanged and showed an error. The original emulator rules were restored immediately. No production appointment was touched.
- The progress page also rendered for the synthetic student at 320 and 1440 px with no horizontal overflow. Earlier navigation timeouts were caused by a cold, memory-heavy local development server; after restarting and warming the routes, schedule and progress returned HTTP 200 and rendered.

## Limits

- Data and accounts were synthetic in local emulators. The checks do not prove behavior for real appointments or every role and device.
- The repository's current Firestore rules permit broad authenticated access. This agenda change does not fix that authorization gap.
