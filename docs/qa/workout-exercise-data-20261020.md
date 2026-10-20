# Workout exercise data QA — 2026-10-20

Workout reads now normalize exercise names from strings and object-shaped records. This prevents an object-shaped entry from rendering as `[object Object]` in the student workout detail, while preserving the index used by parallel sets/reps arrays.

Verified an authenticated synthetic student against local Firebase emulators. A pending workout with `{ nome: "Alongamento" }` displayed “Alongamento”; a completed workout with `"Agachamento"` displayed “Agachamento”. Neither displayed `[object Object]` or had page-level horizontal overflow at 320, 390, 768, or 1440 px. TypeScript checking passed. These are synthetic records; no production workout was changed.

The integrated Hosting review channel is built from a separate QA checkout containing other ongoing local work, so its deployed output is not a byte-for-byte build of this branch alone.
