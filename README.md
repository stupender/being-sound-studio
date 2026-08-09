# beingsound.studio

The website for Being Sound — a sonic arts studio by Stu Pender.

A single-page site with no build step, no framework, and no dependencies:
three HTML/CSS/JS files, served as static files by GitHub Pages.

- **Live:** [beingsound.studio](https://beingsound.studio)
- **How to run, change, and deploy it:** [MAINTENANCE.md](MAINTENANCE.md)
- **Site audit and priorities (July 2026):** [AUDIT.md](AUDIT.md)
- **Concepts log:** [LEARNED.md](LEARNED.md)

---

## How the site works

Every page already exists inside `index.html` at the same time. Navigating
doesn't load a new document — it adds a CSS class called `show` to one section
and removes it from the others, then rewrites the address bar. All of it is
driven by a single object, `pageRegistry`, in `script.js`:

```js
listen: {
  path: "/listen",                        // the URL
  title: "Listen | Being Sound Studio",   // the browser tab
  sections: [listenCard],                 // which blocks become visible
}
```

Adding a page means adding an entry there — not writing new routing code.

`404.html` is an exact copy of `index.html`. GitHub Pages serves it whenever
someone opens a URL directly, and the site then routes itself to the right
page. **This is why `404.html` must be re-copied after every change.**

---

## Email capture

The site collects email addresses on its own pages and sends them to Kit
(the list service). Nothing about the visitor's experience leaves this site:
our pages, our design, our thank-you page.

**How the wiring works.** Any `<form class="capture-form">` is picked up
automatically by `forms.js`. Each form describes its own behavior with
HTML attributes:

```html
<form class="capture-form"
      data-source="listen"              <!-- tag saved in Kit -->
      data-success="redirect"           <!-- or omit, for inline success -->
      data-redirect="listen-welcome">   <!-- which page to show -->
```

On submit, `forms.js` checks the honeypot (spam trap), validates the address,
posts it to Kit, and then either shows a delivery page or an inline
confirmation — without ever reloading the page.

**Where the backend endpoint lives:** one line at the top of `forms.js`.
That's the only place to change if the list service ever changes. There is no
API key in this site — the Kit form URL is public by design, so there's
nothing to leak. See MAINTENANCE.md for the full security note.

**Current doors:** `/listen` (freebie), `/loop` (the QR code on printed
cards), the events page, and the footer on every page. Each is tagged with a
different `source` so Kit shows which door each subscriber came through.

**Adding another freebie** is a copy-paste job — the recipe is in
MAINTENANCE.md.

---

## Other pieces

- **The music player.** A transport bar at the top plays tracks from
  `Samples/`. Any `.playlist-play-btn` with a `data-src` hooks into it
  automatically — which is how the freebie soundscape plays through the same
  bar as everything else.
- **The events calendar** reads from a public Google Calendar. When there's
  nothing upcoming, the block hides itself rather than announcing an absence.
- **Outbound links** get a small ↗ marker, added by `forms.js`, so leaving the
  site is never a surprise.
