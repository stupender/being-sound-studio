# Fretboard Constellations — porting notes

This folder holds a **build output**, not source. The app's source lives in
the separate `stupender/method` repo.

## What was built

| | |
|---|---|
| Source repo | `github.com/stupender/method` |
| Source commit | `f673cdf` — "Stems turn over at the middle line" |
| Which was | the tip of `origin/main`, i.e. what was live at the time |
| Built with | `npx vite build --base=/fretboard-constellations/` |
| Output size | ~1.5 MB |

The commit matters: at the time of porting, the local `method` working copy was
one commit ahead of `origin/main` and had uncommitted work in progress. This
build deliberately excludes both — it is only what was published.

`--base` is passed as a flag rather than edited into `vite.config.ts`, so the
`method` repo is untouched by this port. Its own config still says `/method/`
and `stupender.github.io/method/` still works.

## To rebuild from a newer commit

```
git clone https://github.com/stupender/method.git
cd method && git checkout <commit> && npm ci
git apply /path/to/lessons-link.patch
npx vite build --base=/fretboard-constellations/
```

Then replace this folder's contents with `dist/`, keeping `PORTING.md` and
`lessons-link.patch`.

## The lessons link

The app's own footer gains one line after the Substack line:

> Stu teaches **guitar lessons** at Being Sound.

This is a **source patch**, not an edit to the built output — `lessons-link.patch`
in this folder adds a `LESSONS` constant to `src/ui/links.ts` and renders the
line in `src/App.tsx`, following the footer's existing pattern (an empty URL
renders nothing). It is not in the `method` repo; apply it after checkout:

```
git apply /path/to/lessons-link.patch
```

An earlier version of this port appended a separate strip below the app's
footer, which duplicated the "Built by Stu Pender" credit already there. That
is gone.

## Isolation

- Own folder, own bundled CSS and JS. It shares nothing with the site's
  `styles.css`, `script.js` or `forms.js`.
- GitHub Pages serves this directory before `404.html` ever fires, so the
  site's SPA router never sees these URLs.
- The service worker registers from `/fretboard-constellations/sw.js`, so its
  scope is **this folder only** and it cannot cache or intercept the rest of
  beingsound.studio.

## To undo the whole port

```
git revert <the porting commit>
```

That removes this folder and restores both the Tools card links and the
`data-outbound` hook in `forms.js` in one step. Everything the port touched
outside this folder is:

- `index.html` — 4 link hrefs on the two Fretboard cards
- `404.html` — the same 4
- `forms.js` — a `data-outbound` opt-in for the outbound arrow
