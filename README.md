# Grondpad

A private daily check-in app: mood, habits, a prompted journal, a merged history, and a
reflection companion. Single-file HTML PWA — no build step, no dependencies, no server.
Runs from a phone home screen and syncs an encrypted blob to a private GitHub repo.

| Tab | What it does |
| --- | --- |
| **Today** | Mood check-in (1–10 plus a note), then the habit rows with streaks |
| **Journal** | Free writing, or one of twelve rotating reflection prompts |
| **History** | 30-day mood trace, then every logged day in full — mood, ticks and entries on one card |
| **Talk** | Reflection companion with recent context (needs an endpoint, see below) |

Habit management lives behind **Manage** in the header, where Bloupunt put it, rather
than taking a fifth tab slot.

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

Everything lives in one `grondpad-data` object in `localStorage`:

| Key | Shape | Meaning |
| --- | --- | --- |
| `habits[]` | `{id, name, type, cue, days{}, mAt}` | Bloupunt's model, all six habit types |
| `mood{}` | `dayKey -> {score, note, mAt}` | one check-in per day, editable |
| `journal[]` | `{id, date, prompt, text, mAt}` | newest first |
| `gone{}` / `jgone{}` | `id -> timestamp` | deletion tombstones |

Every field rides the same encrypted blob and the same union merge, so a day written on
the phone is never lost to a later write from the desktop. Where two devices genuinely
disagree about one value, the newer `mAt` stamp wins.

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
