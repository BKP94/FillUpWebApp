# FillUp — design system (locked)

Written by `hallmark redesign` (scope: app). Every page shares this system. Pages differ in layout, never in tokens, type or voice.

## Intent

- **Who:** Thai drivers logging a fill-up on their phone at the pump, one hand free.
- **Job:** record a fill-up fast, then read what it means.
- **Tone — Instrument.** The app should read like a car's gauge cluster and a fuel receipt: big tabular numbers, square-shouldered type, hairline rules, brand blue for structure and a single red signal for the one action that matters.
- **Genre:** modern-minimal · designed-as-app (Operate mode).

## Colour (OKLCH, `src/styles/tokens.css`)

| Role | Token | Light | Dark |
| --- | --- | --- | --- |
| Page | `--color-paper` | oklch(0.975 0.005 250) | oklch(0.17 0.025 255) |
| Panel | `--color-panel` | oklch(1 0 0) | oklch(0.215 0.03 255) |
| Sunken | `--color-sunken` | oklch(0.955 0.008 250) | oklch(0.19 0.028 255) |
| Ink | `--color-ink` | oklch(0.27 0.05 255) | oklch(0.95 0.012 250) |
| Muted ink | `--color-ink-muted` | oklch(0.47 0.035 255) | oklch(0.77 0.025 250) |
| Faint ink (≥ 4.5:1) | `--color-ink-faint` | oklch(0.53 0.03 255) | oklch(0.69 0.025 250) |
| Rule | `--color-rule` | oklch(0.9 0.012 250) | oklch(0.32 0.035 255) |
| Strong rule | `--color-rule-strong` | oklch(0.8 0.02 250) | oklch(0.42 0.04 255) |
| Brand blue (structure, links, chart) | `--color-accent` | oklch(0.47 0.15 253) ≈ #0056a6 | oklch(0.78 0.11 240) |
| Sky (secondary data) | `--color-sky` | oklch(0.69 0.13 232) ≈ #27a9e1 | same |
| Red signal (fill-up action only) | `--color-signal` | oklch(0.56 0.2 22) ≈ #d92338 | oklch(0.64 0.19 22) |
| Danger (destructive) | `--color-danger` | oklch(0.5 0.17 25) | oklch(0.78 0.11 22) |

Red is the **one** signal: the fill-up button, the active-nav tick and the heading full stop. Destructive actions use `--color-danger` as text/outline, never a filled red button that competes with the fill-up action.

## Type

- **Display & numbers:** Bai Jamjuree 500/600/700 (`--font-display`). Squared, gauge-like, Thai + Latin. Always `font-variant-numeric: tabular-nums` on figures.
- **Body:** IBM Plex Sans Thai 400/500/600 (`--font-body`).
- Bundled through `@fontsource` so the PWA works offline.
- Thai floor: nothing below **13px**; body 16px; line-height 1.6 for Thai body.
- Headings roman only. No italic anywhere in headings.
- Scale: 13 · 14 · 16 · 18 · 22 · 28 · 36 · 56 (readouts).

## Space & shape

- 4pt named scale: `--space-1` 4 … `--space-16` 64.
- Radius: `--radius-s` 4px (inputs, chips), `--radius-m` 8px (panels), `--radius-l` 14px (sheet top). Squared-off; no pills except the toggle.
- Panels are separated by **hairlines**, not shadows. One shadow token (`--shadow-float`) for floating elements only (toast, sheet, mobile fill-up button).

## Motion

- Easings: `--ease-out` (enter), `--ease-in-out` (move), `--ease-in` (exit). Durations 120 / 200 / 320ms.
- `prefers-reduced-motion`: movement (transforms, slides) is removed; colour/opacity feedback stays; the loader keeps spinning slowly.

## Components & voice

- **Readout:** label (13px, muted) → figure (display, tabular) → unit (small, muted) → note.
- **Receipt rows:** label · dotted leader · figure. Used for monthly totals, statistics, record detail, vehicle details.
- **Ledger rows:** a date block (day + month) · details · amount. Used for record lists.
- **Odometer:** digits set in boxed cells, read as one label by assistive tech.
- **Buttons:** `primary` (blue), `signal` (red, fill-up only), `secondary` (outline), `ghost`, `danger` (danger outline). Min height 44px, one line, all 8 states.
- Focus: 3px `--color-focus` outline, 2px offset, on every interactive element.
- Copy: short, plain Thai; numbers carry units; no invented metrics.

## Layout

- App shell: sidebar 248px ≥ 761px; bottom nav + floating red fill-up button ≤ 760px.
- Breakpoints: ≤ 370 · ≤ 760 · 761–1190 · ≥ 1600.
- `overflow-x: clip` on html and body; grid tracks `minmax(0, 1fr)`.
