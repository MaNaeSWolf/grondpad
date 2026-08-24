# Grondpad

A private daily check-in app — mood tracking, habits, a prompted journal, and a
reflection companion. Single-screen, phone-width, local-first.

Five tabs:

| Tab | What it does |
| --- | --- |
| **Today** | 1–10 mood slider with an optional one-line note, plus habit ticks and streak counts |
| **Journal** | Free writing, or one of twelve rotating reflection prompts |
| **History** | 30-day mood chart with a running average, and a full day-by-day log |
| **Habits** | Add and remove habits; 14-day consistency grid |
| **Talk** | A reflection companion that reads recent moods and journal snippets for context |

## Credit

The application code (`src/App.jsx`) was written by **Cora**. This repo packages
it as a runnable Vite project and is maintained by [@MaNaeSWolf](https://github.com/MaNaeSWolf).
`App.jsx` is committed unmodified from the original.

## Running it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Project layout

```
src/App.jsx      Cora's component, unmodified
src/storage.js   localStorage shim (see below)
src/main.jsx     React entry point
```

### The storage shim

`App.jsx` reads and writes through `window.storage.get(key)` / `.set(key, value)`,
an API provided by the environment it was originally written for. `src/storage.js`
installs a `localStorage`-backed version of that interface before React mounts, so
the app runs in a normal browser without touching `App.jsx`.

All data lives in the browser under the `grondpad-*` keys. Nothing is sent
anywhere except the Talk tab's API call. Clearing site data wipes the record;
there is no export yet.

## Known issues

Carried over from the original file, not yet fixed:

- **The Talk tab does not work as written.** It `fetch`es `api.anthropic.com`
  directly with no `x-api-key` and no `anthropic-version` header, so every
  request 401s. Fixing it by adding the key client-side would ship that key to
  every browser that loads the app — it needs a small server endpoint holding the
  key instead. The request also sends its brief as a fake user/assistant exchange
  rather than the `system` parameter.
- **Failed writes are reported as successes.** `save()` returns `false` when
  storage throws, and every caller ignores it — the mood button still reads
  "Saved for today".
- **A message that fails to send is not persisted** and disappears on reload.
- **Crossing midnight with the app open** leaves yesterday's mood and note on
  screen marked as saved for the new day.
- **Deleting a habit orphans its tick history**, which then vanishes from the
  grid and the day log.
- **Journal entries delete without confirmation.**

## Privacy

This repo is private on purpose. `COMPANION_BRIEF` in `src/App.jsx` contains a
personal profile — occupation, stated preferences, and self-described patterns.
Replace it with a generic brief before making this repo public or sharing it
outside the two of us.
