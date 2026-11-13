# Nick's Golf Site

**Live:** https://njindal14.github.io/golf/

Course Log + Course Ledger + 2027 Plan + Bucket List — one static site on GitHub Pages.

| Tab | What it is | Data file |
|---|---|---|
| Home | Dashboard: stats, next up, recently played, best-ranked, photos | (reads everything) |
| Calendar | Rounds you log (+ Round) | `data.js` |
| Rankings | Top100 state / USA / World ranks for every course + your own ranks | `ledger-data.js` |
| Ledger | Every course played or wanted, by architect, with photos | `ledger-data.js`, `photos.js`, `photos/` |
| 2027 Plan | Trips, rater rounds, majors, blocked dates | `plan-data.js` |
| Bucket List | Courses to chase, by rater region | `plan-data.js` |

## Editing — nothing to copy or overwrite

1. On each device you edit from, click **Connect GitHub** (top right) once and paste a
   fine-grained token with **Contents: Read and write** on this repo only (the dialog links to a pre-filled form).
2. From then on every edit — rounds, Ledger ticks and notes, trips, bucket list, photos — is
   committed to this repo automatically ("Saved to GitHub" in the top bar). Pages refreshes in ~1 minute.
3. Every page load on a connected device pulls the latest data straight from GitHub, so a phone,
   a laptop, and Claude's edits all stay in step.

Devices that aren't connected can still view everything (edits there stay in that browser only).

## Password

Connect GitHub → **Site password** to lock the site. Each device asks once. It hides the site, but the repo itself is public on GitHub's free plan.

## Photos

- **On the site:** Ledger → open a course → **+ Add photos**. They're resized to web size in the browser and committed. × removes one.
- **From the Mac:** drop files into `photos/<course-id>/` and run `python3 update_photos.py`, then commit/push.

Originals live in `~/Desktop/Golf Pics`; the copies here are resized.

## Asking Claude

Claude can attach this repo (`njindal14/golf`), edit the data files directly, and push — see `CLAUDE.md`.
