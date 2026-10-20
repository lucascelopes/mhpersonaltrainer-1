# Student progress responsive QA — 2026-10-20

The student progress page now has a centered maximum width on wide screens, four metrics in one row, and two balanced sections for recent workouts and evaluations. Empty-state actions keep a readable width. The 320–390 px layout remains two metric columns with stacked sections. Progress links and actions have at least 44–48 px touch height on tablet and mobile.

Verified an authenticated synthetic student against local Firebase emulators at 320, 390, 768, and 1440 px. The page rendered its empty-data state without horizontal overflow at those widths. At 768 px the back button and section links measured 44 px high and the contact action 48 px. Inspected the 1440 px render visually. The complete Hosting export compiled all 108 routes.

Also seeded two synthetic workouts (one complete, one pending) and one completed evaluation in local emulators. The page showed 2 workouts, 1 complete, 1 pending, and 50% completion; the lists and evaluation link rendered at 320, 390, 768, and 1440 px without horizontal overflow. This does not verify real production history. Production data was not changed. The integrated Hosting preview is built from a separate QA checkout with other ongoing local changes, so it is not a byte-for-byte build of this branch alone.

Updated Firebase Hosting review channel `revisao-20261018` in `profissions-2746d` to version `7ef8621af3382d31`, expiring 2026-10-27. The main Hosting channel was not updated. External HTTP returned 200 for `/login`, `/progress`, `/schedule`, and `/invite`; all 25 JavaScript and CSS assets referenced by `/progress` returned 200.
