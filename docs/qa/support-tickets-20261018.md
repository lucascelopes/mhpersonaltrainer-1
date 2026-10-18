# Support ticket lifecycle review - 2026-10-18

## Changes

- Shared priority parsing recognizes accented persisted values such as `Crítica`
  and `Média`. Previously, the Admin treated a critical ticket from the form as
  low priority, and the support home did not count it as urgent.
- Shared status resolution respects an explicit open/in-progress/replied/resolved
  state. A legacy reply without a status is treated as replied. A reply alone no
  longer makes the support home count a ticket as resolved.
- The requester history now displays the saved team response and its date.
  Previously, the Admin saved the reply but the requester could not read it there.
- User/Admin summaries now include Replied, so answered tickets do not disappear
  from the status breakdown. The Admin uses readable priority/status labels.
- Admin reply submission requires nonempty text. Feedback is associated with the
  affected ticket. Moving an unchanged response to in-progress or resolved keeps
  its original response timestamp, rather than presenting it as a new answer.
- Form/filter/action controls have minimum 48px heights and 16px field text across
  desktop/mobile. The response block wraps text, preserves paragraphs, and has
  explicit light/dark styling. Dark success/error feedback uses readable colors.
  Eight priority/status badge pairs have explicit dark colors with a minimum
  calculated text/background contrast of 8.27:1. Badge classes use canonical
  priority keys, independently of their accented display labels.

## Evidence

Tests used two independent browser sessions: a synthetic Student and a synthetic
Admin, a local Next app on port 3002, and only `demo-mhpersonal` Auth/Firestore
emulators on ports 9099/8080. No real customer ticket or production data changed.

1. Student submitted an empty subject and a short description. Both showed
   validation messages; independent REST reads found no new ticket.
2. Student created one critical technical ticket through the form. REST confirmed
   one persisted record with localized priority `Crítica` and status `aberto`.
3. Admin displayed Critical correctly. Trying to reply with empty text showed an
   error and left the persisted ticket open.
4. Admin marked in-progress and replied. REST confirmed each state transition and
   the exact saved response. The Student's separate live history displayed the
   response, its date, and Replied, with summary Total 1 / Replied 1 / Resolved 0.
5. Student support-home metrics showed Total 1 / Open 1 / Resolved 0 / High
   priority 1. A response was correctly kept unresolved at this point.
6. Admin moved the answered ticket back to in-progress, then resolved it. REST
   confirmed unchanged response text/timestamp. Student home updated to Open 0 /
   Resolved 1. The channel remained connected after an emulator transaction retry.
7. User and Admin pages were measured at 320, 390 and 1440px in both themes. There
   was no horizontal document/body overflow; tested form/filter/action controls
   were >=48px. A 45px desktop-field finding was fixed and the matrix repeated.
   Local captures: `output/playwright/ticket-{student,admin}-*-20261018.png`.
8. `node web-next/scripts/qa-support-ticket-state.cjs` passed 17 priority/status
   cases, including explicit statuses with existing replies and legacy records.
   TypeScript, PostCSS parsing and diff checks passed.
9. The current local app's Hosting build passed with all 108 pages using the
   configured production Firebase project. The isolated branch also passed a
   static build during validation; subsequent badge-color refinements were
   validated by CSS parsing, browser computed colors and the local Hosting build.

## Remaining scope

The broad four-role design/functionality goal is still open. The Student login
still blocks widths >=1000px; this test logged in at mobile width before testing
the authenticated ticket page on desktop. That gate needs a separate fix and
desktop login verification. Other pending work includes ticket read-failure
states, the other role/route families, production database authorization rules,
historical duplicate chats, physical devices, and screen-reader verification.

This increment does not deploy database rules or prove owner/role data isolation.
