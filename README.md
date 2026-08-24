# Grondpad

A private daily check-in app you assemble yourself. Single-file HTML PWA — no build
step, no dependencies, no server. Runs from a phone home screen and syncs an encrypted
blob to a private GitHub repo.

There are no tabs and no fixed screens. There is **one scrollable stack of cards**, in
whatever order you arrange them, and you choose which cards exist. Everything is added
through the same **+ Add a card** button:

| Card | What it does | How many |
| --- | --- | --- |
| **Tick** | A simple daily tick. Streaks, milestones, the warming background | any |
| **Count + / − / ±** | Tap to count something up, down, or both | any |
| **Time of day** | Logs the first time something happened | any |
| **Day score** | Tallies every card you logged, worth more as each chain lengthens | one |
| **Mood** | 1–10 scale with an optional line on why | one |
| **Journal** | Somewhere to write, with a prompt when you need one | one |
| **Talk** | Reflection companion that knows your recent context | one |

Every card collapses and expands. Collapsed, a Mood card is just the slider — releasing
it logs the day. Expanded, it adds the note, the 30-day trace, and its calendar.

**Each card carries its own history.** Tap a day in a card's month grid to read what was
there: that day's mood and note, the entries you filed, the conversation you had. There
is no separate history screen — history belongs to the thing that recorded it.

Card management — renaming, reordering, removing — lives behind **Manage** in the header.

## Credit and provenance

Grondpad began as a React component written by **Cora**, kept verbatim at
[`reference/original-App.jsx`](reference/original-App.jsx). This version keeps her
reflection layer — the mood scale, the prompts, the day-by-day merge, the companion
brief — and rebuilds it on top of the habit engine, crypto and sync layer from
[Bloupunt](https://github.com/MaNaeSWolf/bloupunt).

**Bloupunt and Vasbyt are not modified by this project.** Bloupunt is in daily use;
code was copied out of it, never back into it.

## Architecture

One file. `index.html` carries the markup, styles and all logic; `sw.js` is the service
worker that makes a cold offline launch work. There is nothing to install and nothing to
build — open the file and it runs.

```
index.html                 the whole app
sw.js                      offline shell cache — bump VERSION when index.html changes
reference/original-App.jsx Cora's original React component, unmodified
```

### Data

Everything lives in one `grondpad-data` object in `localStorage`. **A card is a card**,
whatever its type — a habit, the day score, the mood scale and the journal are all one
kind of object in a single `cards[]` array:

```js
{ id, name, type, days:{}, mAt,   // every card
  notes:{},                        // mood — dayKey -> the line you wrote
  entries:[], gone:{},             // journal — entries + their tombstones
  chat:[] }                        // talk — capped transcript
```

`days{}` is the whole trick. **Presence means "engaged today"**, so a mood check-in, a
journal entry and a habit tick are indistinguishable to the scoring code — they all flow
through the same `chainRun` with no special-casing. Logging is the unit and the value is
ignored: a 1/10 day scores exactly as much as a 10/10 one, because being penalised for
honestly recording a bad day is how people stop recording.

Cards that only display (the day score) hold no `days{}` and are skipped everywhere.

Every card rides the same encrypted blob and the same union merge, so a day written on
the phone is never lost to a later write from the desktop. Where two devices genuinely
disagree about one value, the newer `mAt` stamp wins. A Bloupunt backup — which carries
`habits[]` rather than `cards[]` — imports here as a stack of habit cards.

### Sync

`localStorage` is the source of truth; sync is a non-blocking backup. The payload is
AES-GCM encrypted with a PBKDF2-derived key (150k iterations, SHA-256) and PUT to a
private data repo through the GitHub contents API. GitHub sees ciphertext only.

Set it up per device under **Manage → Manage sync**: GitHub username, the private data
repo, a fine-grained token scoped to *only* that repo with Contents read+write, and your
passphrase. **The passphrase never leaves the device — lose it and the backup is
unreadable.**

The token cannot be hidden in a browser app. The blast radius is bounded instead: it is
scoped to one private repo that contains nothing but ciphertext.

## The companion

The Talk tab is **off until you give it an endpoint**. The original called
`api.anthropic.com` directly from the page, which 401'd on every send; a key placed in
this file would be readable by anyone who opens the page, and it is served from GitHub
Pages. So the request goes to a URL you host that holds the key server-side.

Set it under **Manage → Manage sync → Companion endpoint**. It should accept
`{context, messages}` and return `{text}`. Until then the tab explains itself rather
than failing with a misleading connection error.

## Local development

No toolchain. Any static server works — a service worker needs `http://`, not `file://`:

```bash
python -m http.server 8123 --directory .
```

After editing `index.html`, **bump `VERSION` in `sw.js`**. That is the only signal the
browser uses to install the new worker and re-cache the shell. Forget it and phones keep
serving the old page.
