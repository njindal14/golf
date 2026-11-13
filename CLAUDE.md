# Notes for Claude — njindal14/golf

Static site (no build step) served by GitHub Pages from `main` / root at https://njindal14.github.io/golf/.
Nick's golf site: Course Log (rounds), Course Ledger (courses played/wanted), 2027 Plan, Bucket List.

## Files
- `index.html` — Course Log app + nav/router. Routes: `#/`, `#/ledger`, `#/calendar`, `#/rankings`, `#/plan`, `#/bucket`.
- `sync.js` — GitHub sync (`window.GHSync`). Connected browsers commit edits via the contents API and pull fresh data on load.
- `data.js` — `const PLAYERS = [...]; const ROUNDS = [...]` (rounds: date, course, city, architect, status played|upcoming, scores, tags, tees, notes…).
- `ledger-data.js` — `const LEDGER_DATA = [ {id, name, town, state, year, played, playedYear, architects[], renovations[], notes, photos[]} ]`, one JSON object per line. `id` is the stable key (also the photo folder name).
- `photos.js` — `const PHOTOS = { "<course-id>": ["photos/<course-id>/x.jpg", ...] }`. Regenerate with `python3 update_photos.py` after adding/removing files in `photos/`.
- `plan-data.js` — `const PLAN_DATA = { events: [...], bucket: [...] }`.
  - event: `{id, title, cat: trip|rater|tournament|club|pro|block|personal, status: confirmed|planned|applied|tentative|idea, start, end (YYYY-MM-DD) OR month (1-12 when dates TBD), loc, with: ["Dad","Sean","Sister",...], notes}`
  - bucket: `{id, name, loc, region, arch, window, who, status: want|requested|booked|played, deepdale: bool, notes}`
- `ledger.js`, `plan.js` — tab code. `update_photos.py` — photo resize + manifest.

## How to make changes
- Edit the data files directly (keep them valid JS; the site evaluates them). Keep ledger-data.js one course per line.
- Photos: resize to ≤1800px JPEG (~80 quality) into `photos/<course-id>/`, then update `photos.js` (or run update_photos.py).
- Commit with a short message and push to `main`. Nick's browsers pick changes up on next load.
- Nick's local copy lives at `~/golf_courses_tracker` on his Mac (same repo); it may lag — pull before relying on it.
- Ask before deleting courses, rounds or photos.
