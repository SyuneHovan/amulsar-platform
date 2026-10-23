# Doodle Jump movement reference — 2026-10-23

The mobile game's proprietary physics constants are not publicly documented. This change matches the **browser reference's** width-normalized movement, and uses Lima Sky's published screenshots and controls to check proportions. It does not claim byte-identical behavior across all mobile editions.

Sources inspected:

- Lima Sky's official listing and screenshots: https://play.google.com/store/apps/details?id=com.lima.doodlejump&hl=en
- Original paid iPhone listing: https://apps.apple.com/us/app/doodle-jump/id307727765
- Browser reference loaded by https://doodlejump.fun/ : https://g.w3technic.com/dj/doodle.min.js

The browser host is independent of Lima Sky. Its executable reference uses a 640 × 960 world, 1080 px/s bounce, 1728 px/s² gravity, 1080 px/s terminal falling speed, 600 px/s horizontal limit and 114 px ledges. Only behavior and scalar measurements informed this implementation; no reference assets or implementation were copied.

## Calibration

All spatial values are multiplied by 390/640; seconds are unchanged. The existing 390 × 760 Amulsar playfield, artwork, chapters and timers remain.

| Quantity | Reference | Amulsar world |
|---|---:|---:|
| Jump velocity | −1080 px/s | −658.125 units/s |
| Gravity | 1728 px/s² | 1053 units/s² |
| Apex height | 337.5 px | 205.664 units |
| Time to apex | 0.625 s | 0.625 s |
| Return to take-off height | 1.25 s | 1.25 s |
| Maximum fall speed | 1080 px/s | 658.125 units/s |
| Maximum sideways speed | 600 px/s | 365.625 units/s |
| Standard ledge width | 114 px | 69.469 units, ±6% |
| Spring velocity | −1800 px/s | −1096.875 units/s |
| Camera threshold | 48% of height | 48% of height |

The old Amulsar bounce reached only ~97 units. Simply reducing its speed preserved a short hop and forced a narrow single-file route. This profile changes the height, duration, steering, spacing and camera together.

## Platform field

The new generator uses variable 31–124 unit vertical spacing, dense patches, sparse stretches, broad horizontal scattering, short and long sideways moves, wrap routes and occasional branches. Special ledges retain solid alternate landings. Ordinary adjacent route steps have at least 25 units of vertical and 30 units of lateral reach margin from a center-start jump; the entire route is checked. Every chapter retains 320 main ledges and 24 collectibles.

## Saves and testing scope

The new route is saved as `amulsar_doodle_run_v6`. Older v3/v4/v5 runs resume at their chapter's beginning; unlocked chapters, selected skin and banked chapter scores remain. Current v6 saves restore positions and elapsed time.

Current checks: `pacing.cjs`, `campaign-mechanics.cjs`, `regression.cjs`, `extra.cjs`, `flower-feedback.cjs`, `reference-feel.cjs`.

`reference-feel.cjs` tests reachability and exact flight timing and uses explicitly synthetic fixtures for the four research stations. The older `campaign-journey.cjs` and its result are historical evidence for the previous short-hop profile. Its greedy pilot was tried against this profile but repeatedly skipped collectibles and eventually ran out of lives; a complete 96-collectible earning playthrough is **not** certified for this revision. The station fixtures do not substitute for such a playthrough.
