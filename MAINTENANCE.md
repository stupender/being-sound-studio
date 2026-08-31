# Maintenance

Everything you need to run, change, and deploy this site.

---

## The one rule that matters

**`404.html` must always be an exact copy of `index.html`.**

```bash
cp index.html 404.html
```

Run that after *every* change to `index.html`, before deploying. If you skip
it, direct links break — including the QR code on your cards.

*Why:* GitHub Pages can't rewrite URLs. When someone opens
`beingsound.studio/loop` directly, Pages can't find a `/loop` file, so it
serves `404.html` instead — which, being a copy of the whole site, then routes
itself to the right page. That's the trick the whole site depends on.

---

## File map

| File | What it does |
|---|---|
| `index.html` | Every page of the site, in one file |
| `404.html` | **A copy of `index.html`** (see the rule above) |
| `styles.css` | All styling |
| `script.js` | Page routing, the calendar feed, the music player |
| `forms.js` | Email capture + outbound-link markers |
| `audio/` | Freebie soundscapes offered on the site |
| `video/` | Background footage (compressed for web — see below) |
| `Samples/` | Music for the site's player — **don't put freebies here** |
| `assets/qr/` | Printable QR codes |
| `images/` | Photography and artwork |
| `AUDIT.md` | The site audit (July 2026) |
| `LEARNED.md` | Concepts log, one line each |

---

## Run it locally

```bash
python3 -m http.server 8765
```

Then open **http://localhost:8765/index.html**.

Note: direct paths like `/listen` won't work locally (that needs the
`404.html` trick, which only GitHub Pages does). Load the root and click
through instead. If a change doesn't appear, hard-refresh: **Cmd-Shift-R**.

---

## Deploy

```bash
cp index.html 404.html
git add -A
git commit -m "Describe what changed"
git push
```

GitHub Pages publishes from the `main` branch. Live in a minute or two at
**beingsound.studio**.

---

## The email list — the single place things live

**The backend endpoint lives in exactly one place:** the top of `forms.js`.

```js
const KIT_FORM_ENDPOINT = "https://app.kit.com/forms/9739307/subscriptions";
```

That's the only line to change if you ever switch services. `9739307` is the
Kit form ID.

**Security:** there is no API key anywhere in this site, so there's nothing to
leak and nothing to rotate. That URL is public by design — the worst anyone
can do with it is subscribe to your newsletter. If you ever move to a service
that *requires* a secret key, don't put it in these files; that would need a
different setup.

### Where the capture forms are

| Where | Tagged in Kit as | On success |
|---|---|---|
| `/listen` | `listen` | Goes to the welcome page (freebie plays + downloads) |
| `/loop` (QR target) | `loop` | Goes to the same welcome page |
| Events page | `loop` | Says "You're in." without leaving the page |
| Footer (every page) | `footer` | Says "You're in." without leaving the page |

The `source` tag is how you tell in Kit which door someone came through.

---

## Common jobs

### The twelve soundscapes

The masters live in `audio/Soundscape In 12 Keys/` — **12 GB, and each mp3 is
144 MB**. They are deliberately excluded from git: GitHub refuses any file over
100 MB, so committing them would break the push outright.

What the site actually carries:

| File | Size | What it is |
|---|---|---|
| `audio/soundscape-in-c-preview.mp3` | 4.6 MB | A five-minute excerpt, the only audio hosted |
| `images/twelve-soundscapes.jpg` | 209 KB | The artwork, resized from `IMG_3115.JPG` |

**The full track is delivered by link, not by download from here.** It lives on
Google Drive, shared as "anyone with the link", and the welcome page's
"Download Soundscape in C" button points straight at it:

```
https://drive.google.com/file/d/1N6ljWHNodk6zuKY7OT4ZvrRfxkPxZFFa/view?usp=share_link
```

To swap in a different file, upload it to Drive, set it to "anyone with the
link", and replace that one `href` in `index.html` (then re-sync `404.html`).
**Share the mp3, not the wav** — the wav is 908 MB and most people will give up
on the download; the mp3 is 137 MB and sounds the same on the devices anyone
will actually play it on. After swapping, open the link in a private window to
confirm it does not ask for a Google sign-in.

To remake the excerpt from a different key, or a different stretch:

```bash
ffmpeg -ss 300 -t 300 -i "audio/Soundscape In 12 Keys/Soundscape in C.mp3" -af "afade=t=in:d=4,afade=t=out:st=296:d=4" -c:a libmp3lame -b:a 128k audio/soundscape-in-c-preview.mp3
```

`-ss 300` starts five minutes in; `-t 300` takes five minutes.

### Add a new freebie with its own landing page

1. Copy the `listen-container` and `listen-welcome-container` blocks in
   `index.html`; rename the classes (e.g. `guide-container`).
2. Give the form a new `data-source` (e.g. `data-source="guide"`) and point
   `data-redirect` at your new welcome page's key.
3. In `script.js`, add two `document.querySelector` lines and two entries to
   `pageRegistry` — copy the `listen` and `listen-welcome` entries as models.
   Keep `noindex: true` on the welcome page so it stays out of search.
4. In `styles.css`, add the new class names to the rules that list
   `.listen-container` (search for `listen-container` to find them all).
5. `cp index.html 404.html`, then deploy.

### Replace or add a background video

The Music and Collaborations pages play `video/water.mp4` behind a frosted
panel. **Never put a phone video straight on the site** — the original
`Water.MOV` is 129 MB; the web copy is 756 KB.

Because the footage is completely hidden behind blur, it can be shrunk
brutally without anyone noticing. Blurring it *during* the conversion also
makes the file much smaller (there's less fine detail left to store):

```bash
ffmpeg -ss 2 -t 12 -i images/YourClip.MOV -vf "scale=480:-2,gblur=sigma=2.5,fps=15" -an -c:v libx264 -profile:v main -pix_fmt yuv420p -crf 36 -preset veryslow -movflags +faststart video/your-clip.mp4
```

`-ss 2 -t 12` takes 12 seconds starting 2 seconds in; pick a stretch that
loops without an obvious jump. Aim to stay under about 1 MB.

**Not a GIF.** A GIF of the same clip would be tens of megabytes and limited
to 256 colours. MP4 is smaller, smoother, and plays everywhere.

To use it, point the `<source>` inside that page's `<video class="section-video">`
at the new file.

### Change the QR code's destination

Don't. The QR points at `beingsound.studio/loop`, and that's the point —
you can change anything *behind* that URL without reprinting cards. If you
truly need a new one:

```bash
qrencode -o assets/qr/being-sound-loop.png -t PNG -s 40 -m 4 -l H "https://beingsound.studio/loop"
qrencode -o assets/qr/being-sound-loop.svg -t SVG -s 40 -m 4 -l H "https://beingsound.studio/loop"
```

### Give a project card its link back

Some Apps cards are `<span class="album-card-pending">` — they look normal but
don't click anywhere, because they had no destination yet. To activate one,
turn the span back into a link:

```html
<a class="album-card-thumb-link" href="https://your-url" target="_blank">
```

...and the same for the title span. Then `cp index.html 404.html`.

---

## Things that will bite you

- **Forgetting `cp index.html 404.html`.** The big one.
- **Browser cache.** If a change doesn't show, hard-refresh (Cmd-Shift-R).
- **`Samples/` is load-bearing.** The music player reads from it. Freebies go
  in `audio/`.
- **New dark page not appearing?** It probably needs its class added to the
  rules in `styles.css` that list the other dark containers — including the
  `position: relative` one, or its background image will escape and cover the
  whole page.
