# FillUp implementation

## Architecture
- React + strict TypeScript + Vite, with Thai mobile-first UI and responsive desktop navigation.
- `models`: versioned local entities. `db`: IndexedDB repository with atomic writes and cross-tab notifications.
- `services`: pure full-tank calculations, validation, and JSON/CSV backup. UI never accesses IndexedDB directly.
- `hooks`: application state and asynchronous mutations. `components` / `pages`: accessible reusable UI and five primary screens.
- Vite PWA precaches all application assets. No remote fonts, tracking, API, accounts, or sample records.
- GitHub Actions checks and builds before deploying to GitHub Pages; relative asset paths also support Cloudflare Pages.

## Plan
- [x] Inspect repository and agree architecture through supplied specification (repository is empty).
- [x] Scaffold strict TypeScript, lint, test, build, PWA configuration.
- [x] Implement entities, IndexedDB repository, validated backup, and full-tank calculations.
- [x] Unit test calculations, chronological edits, invalid data, and repository transactions.
- [x] Implement first-run vehicle creation, multi-vehicle management, dashboard, fuel forms, history, statistics, settings.
- [x] Implement light/dark themes, install instructions, offline/update status, safe areas, icons.
- [x] Configure free deployment and write operational documentation.
- [x] Run typecheck, lint, unit tests, production build, and browser integration checks.
- [x] Verify mobile layout, persistence, CRUD, backups, manifest, service worker, and Chromium offline reload.
- [x] Review final implementation and fix findings.

## Calculation policy
Only complete intervals between consecutive full tanks contribute to km/L. Sum every partial fill plus the closing full fill, excluding the opening fill. Aggregate economy is distance-weighted by consumed fuel (`sum(distance) / sum(consumed liters)`). Invalid/reset odometers break the interval; never fabricate an economy. Monthly distance is the sum of positive odometer intervals ending in that month, starting with the first recorded refill (initial odometer has no date). Monetary totals reflect purchases, not inferred consumption.

## Verification log
Verified on 2026-09-04 with Node 24.15.0, Windows:
- `npm run typecheck`: pass.
- `npm run lint`: pass (zero errors/warnings).
- `npm run format:check`: pass.
- `npm test`: 21 passing unit/repository tests, including maximum-size Thai-note backup roundtrip.
- `npm run build`: pass; manifest and Service Worker generated; 15 precache entries, ~330 KiB.
- `npm run test:e2e -- --workers=2`: 13 passed, 1 explicitly skipped (Windows WebKit offline reload internal engine error). Exit code 0.
- Both engines: vehicle onboarding, fuel CRUD, editing old partial fills, delete cancellation, multi-vehicle isolation, cross-tab editor ownership, JSON/CSV export, corrupt-file rejection, import cancellation/replacement, erase/restore, theme persistence, reverse price calculation, unusual-value confirmation, manifest/icons/service worker control, repository subpath hosting.
- Chromium: offline reload + local write + subsequent reload, including scoped GitHub Pages subpath.
- Visual inspection: 360/390/430/768/1440 px; onboarding, dashboard, mobile fuel form, dark settings; no horizontal overflow or page errors in the checked flows. Temporary browser contexts only; no production seed data.
- Standards review: 1 ownership finding, fixed and regression-tested. Spec review: same ownership issue plus backup size inconsistency, both fixed and tested. See `docs/VERIFICATION.md`.

External release checks remain: enable GitHub Pages and push `main` to publish; verify actual iPhone Home Screen install/lifecycle. These require the hosting account/device and are documented in README, not claimed as completed.

## Review fixes — 2026-09-08
- [x] Capture the vehicle and refill versions shown by the delete confirmation; compare them atomically before deleting. Reject stale confirmations without changing data and ask the user to cancel and review again.
- [x] Preserve four-digit calendar years in month keys so saved years below 1000 remain readable and editable in History and Statistics.
- [x] Add regression coverage for concurrent refill additions, edits, same-count replacements, vehicle edits, and year formatting. New cases failed before the fixes and passed afterward.
- [x] Verify both original browser reproductions: stale deletion preserves all records until a fresh confirmation; a saved `0206` date survives reload, displays in History/Statistics, and can be corrected.
- [x] Validation: 32 unit/repository tests passed; TypeScript/build, lint, and formatting passed; Chromium/WebKit browser suite: 17 passed, 1 existing Windows WebKit offline-reload skip. Test data used isolated browser contexts only.
