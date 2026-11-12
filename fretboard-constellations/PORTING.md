# Fretboard Constellations — moved to its own address

Since 2026-10-27 the app lives at **https://fretboardconstellations.beingsound.studio/**,
served by the `stupender/method` repo's GitHub Pages (its `public/CNAME` holds the
domain; DNS has `CNAME fretboardconstellations → stupender.github.io.`).

This folder no longer holds a build. It holds two small files:

- `index.html` — forwards to the new address, keeping `?query` and the
  `#s=…` share code so a setting someone sent still opens exactly.
- `sw.js` — a retiring service worker. Browsers that installed the old copy
  keep a worker scoped to this folder; on their next update check they fetch
  this one, which clears its caches, unregisters itself and reloads the tab
  onto the forwarding page.

There is nothing to rebuild here any more. The lessons link and the link-preview
card that `lessons-link.patch` used to add are now part of the app's own source.

The site's own links to `/fretboard-constellations/` (in `index.html` and
`404.html`) still work through the forward; pointing them straight at the new
address is a tidy-up, not a fix.

## History

Hosted here as a build copy from 2026-09-04 (`a735248`) to 2026-10-27; the last
copy was built from method `e945300`. To bring the copy back, revert the commit
that replaced it with this note.
