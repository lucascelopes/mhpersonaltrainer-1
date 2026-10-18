# Login and shared brand QA - 2026-10-18

## Problem and change
The published preview applied a white logo filter from the dark theme on the fixed pale mobile login surface. BrandLockup now accepts an explicit surface, with light surfaces keeping the original official asset. Public header/footer use the same explicit light surface. Theme-driven application surfaces retain their automatic contrast.

The compact login layout now covers widths through 960 CSS pixels, preventing the shared stacked auth layout from moving the brand below the form on tablets. This branch also captures the existing reviewed login/public branding implementation from the active preview checkout; authentication handlers remain unchanged.

## Verification
- Reproduced original white-on-light logo on the published preview at 390px in dark theme.
- Browser matrix passed at 320, 390, 767, 768, 960, 961, 1024 and 1440px, in light and dark themes: one loaded visible logo, correct surface/filter, brand before email, no horizontal overflow or clipped controls.
- Inspected full-page screenshots at 390px and 1440px in dark theme; captured light/dark screenshots at 320, 390 and 1440px.
- Empty form produces the accessible validation alert; show/hide password preserves its value. No real login attempted in these checks.
- Isolated branch TypeScript check passed. Active preview checkout production build passed, exporting 108 pages.
- Test channel: revisao-20261018, project profissions-2746d. Same production accounts/data. This task does not certify every authenticated flow or every application route.

Screenshots are local QA artifacts in output/playwright, not committed personal data. The preview includes existing active-checkout changes outside this narrow branch. No Firestore rules, accounts or data were deployed by this task.
