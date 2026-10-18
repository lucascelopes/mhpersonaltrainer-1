# Support chat review - 2026-10-18

## Problems and changes

The support page could mark a failed chat as ready, while the shared listener
turned permission errors into an empty message list. A failed send also reused
the connection error state. The page now waits for a successful message snapshot
before showing Connected, disables the composer during connection failure, and
offers Reconnect chat and Open ticket. Send failures retain the draft and have
their own error message. Connection status does not assert that a human agent is
online. Existing listener callers keep their current signature; support uses the
new optional error callback.

Message creation and conversation-summary updates now use a single write batch.
Failure of either write rejects both, preventing a partially persisted message
from being resent by the user. Unread counters retain their existing best-effort
update behavior after the batch succeeds.

Concurrent chat initialization previously created two support conversations in
the synthetic browser session. New conversations now use a stable SHA-256 ID for
the sorted participant pair and a transaction. Existing conversations are still
looked up and reused by their original IDs. This does not merge or delete old
duplicates; previously fragmented histories still need separate review.

Responsive refinements include wrapping connection labels/messages, 48px composer
and recovery controls, 16px input text, neutral unavailable badges, and readable
dark-theme error text.

## Verified evidence

- TypeScript passed in the isolated checkout; the route CSS parsed with PostCSS.
- The isolated static Hosting build passed with all 108 pages and demo Firebase
  build settings. Those demo artifacts were not deployed.
- Browser functional tests ran only against `demo-mhpersonal` emulators (Auth
  9099, Firestore 8080) and the local Next server on port 3002, with a synthetic
  Admin. No real user conversation or notification was sent.
- Denying conversation-summary writes while permitting message creation caused
  Send to fail. An independent emulator REST read found zero messages with the
  unique test marker; the draft was preserved and the connection stayed ready.
- Restoring the emulator rules and retrying persisted exactly one matching
  message and the same text in the conversation summary.
- Denying message reads produced Unavailable with disabled composer/send and a
  reconnect action. Restoring rules and reconnecting recovered the channel.
- Denying the initial conversation read produced the same recoverable unavailable
  state. The original emulator rules were restored after each failure scenario.
- Browser measurements at 320, 390 and 1440px in both themes found no horizontal
  document/body overflow. Composer input/send measured 48px, with 16px input text.
  Six local card captures are under `output/playwright/support-chat-*`.
- `node web-next/scripts/qa-chat-emulator.cjs` passed with eight simultaneous
  calls returning and persisting one new conversation, successful message/summary
  persistence, and reuse of an existing legacy ID without another conversation.
  The script creates and cleans up only synthetic local emulator records/accounts.

## Remaining scope

The broader design and functional review is ongoing. Existing duplicate chat
histories, other chat surfaces, ticket workflows, database authorization rules,
physical devices, and screen readers need further verification. The UI and these
emulator tests do not prove that production data is isolated by owner/role.
This change does not deploy database rules or change production user data.
