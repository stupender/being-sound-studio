# Learned

A running log of concepts, one line each, in the order I met them.

## Site architecture

- **Client-side routing** — the URL changes and the view changes, but the browser never loads a new document; `history.pushState` rewrites the address bar and JavaScript decides what's visible.
- **The `show` class pattern** — every "page" on this site exists in `index.html` at all times; navigating just adds/removes the CSS class `show`, so there is no loading, only revealing.
- **A page registry** — `pageRegistry` in `script.js` is one object listing every page's URL, title, and sections; adding a page means adding an entry, not writing new routing logic.
- **`popstate`** — the browser event fired when someone hits the back button; without a listener for it, back would change the URL but leave the page unchanged.
- **The GitHub Pages SPA trick** — `404.html` is a byte-for-byte copy of `index.html`, so a direct visit to a URL like `/listen` gets served the whole app instead of an error page, and the app then routes itself.

## Forms and email

- **Own the front door, rent the mail truck** — the pages, forms, and design live in this repo; storing addresses and sending mail is a rented service that can be swapped without touching the design.
- **Keyless form endpoint** — some services accept a plain POST at a public URL, so the page needs no API key at all; nothing secret ships to the browser, and there is nothing to leak.
- **Public key vs secret key** — a public key is safe to ship in page source because it can only do one harmless thing; a secret key grants full account access and must never appear in client-side code.
- **Honeypot field** — a form field hidden from humans by CSS; bots fill in every field they find, so anything arriving with it filled is discarded.
- **CORS** — browsers block one site from calling another unless that server replies with a header granting permission; Kit sends `access-control-allow-origin: *`, meaning any site may post to it, which is what lets our form work without a server of our own.
- **Preflight** — before a cross-site POST, the browser quietly sends an `OPTIONS` request asking "am I allowed?"; checking that with `curl` proves the design works before writing a line of code.
- **Bot-filtering / silent success** — list services return "success" to *every* submission so bots can't tell if they got in, then quietly drop ones that look automated (like `curl` from a server); the only trustworthy test is a real browser on the real page.
- **The `Accept` header** — tells a server which reply format you want; asking Kit for `application/json` gets JSON back, and without it Kit returns an HTML page — which is why our first browser test threw an error even though the email *was* accepted.
- **Don't parse what you don't need** — the form only cares *whether* the send succeeded (`response.ok`), not what the reply says, so we stopped parsing the body and the fragility went away.
- **`data-` attributes** — custom `data-something` attributes on an HTML element let one piece of JavaScript behave differently per form (e.g. `data-source`, `data-success`) without writing separate code for each.
- **Per-page `noindex` in a single-page site** — since every route shares one HTML document, a static robots tag would (un)index the whole site; instead the routing flips one `<meta name="robots">` tag as you move between pages.

## Design

- **Reuse the class, don't recreate the look** — the submit button uses the site's existing `.button-link` class rather than a new copy of its styles, so it matches exactly and any future change to that button applies everywhere at once.
- **This site spaces with margins, not padding** — the dark cards have no inner padding; each element (label, paragraph, link) carries its own `margin: …30px`, so a new element must adopt the same 30px to line up. Matching the *system*, not eyeballing the pixels, is what makes an addition look native.
- **Reuse the component, get the behaviour for free** — the freebie player is the site's existing playlist markup (`<ul class="playlist">` + `.playlist-play-btn[data-src]`); because `script.js` grabs every `.playlist-play-btn` at load, our hidden welcome-page item auto-wires to the top transport bar with no new JavaScript. Copying the pattern beat writing a custom player.
- **Autoplay needs a real click** — browsers block audio `.play()` triggered by scripted clicks; only a genuine user gesture (a real mouse click) counts, which is why a scripted test showed "paused" even though the wiring was correct.
- **`backdrop-filter` is the CSS for frosted glass** — it blurs whatever is *behind* an element, so a translucent dark panel over an image becomes "Apple Glass"; it needs something actually behind it to blur, and Safari wants the `-webkit-` prefix.
- **`:has()` selects a parent by its children** — `.album-card:has(.album-card-image)` styles only cards that contain an image, letting the glass treatment skip the video cards with no HTML changes.
- **Keep an experiment in one block** — the whole glass experiment lives in a single marked section at the end of styles.css, so trying it costs nothing and reverting it is one deletion.
- **`position: absolute` needs a positioned parent** — an absolutely-placed background image measures itself against the nearest ancestor with `position: relative`; miss that one line and the image escapes and covers the entire page (exactly what happened to /loop).
- **A new page must be added to *every* rule that lists its siblings** — adding `/loop` meant touching six separate CSS rules; missing any one produced a different visible bug. When several selectors always travel together, that's a sign they want to be one shared class.
- **ID vs class** — an `id` is meant to be unique on a page; `class` is for anything reused. `id="about-text"` appeared 24 times, which browsers tolerate but is invalid, so it became `class="about-text"`.
- **Stub the network to test a code path** — replacing `window.fetch` with a fake that returns success let me prove the footer's "You're in." path works without sending real test emails into the mailing list.
- **A border is four separate edges** — `border: none` then `border-bottom: 1px solid` turns a boxed input into a single underline; dropping the side padding to `0` at the same time is what makes the typed text line up with the copy above it.
- **Text fields carry their own focus cue** — the blinking caret already shows which field is active, so a text input can drop the browser's focus ring without anything moving. (Buttons and links have no caret, so those still need a visible focus style.)
- **`object-fit: cover` centres on the box it's given** — stretching the photo across the whole card moved its subject to the middle, which is exactly where the glass edge sits; letting the image fill only its own half restores the original framing.
- **Mirroring announces itself** — a flipped copy reads as a *reflection*, which the eye notices as an effect; repeating the image in the same direction is quieter, and the glass edge already explains the transition. (Tried both; kept the plain repeat.)
- **Duplicate in code, not in markup** — the second image is cloned by a few lines of JavaScript instead of a second `<img>` written into each page, so every page still names its photograph exactly once and can't fall out of sync.
- **`data-` attributes as an escape hatch** — adding optional `data-under="…"` let the About page put a *different* image under its glass without changing the rule for every other page; the default stays "same image", and one page opts out.
- **Dark photos disappear under dark glass** — the frosted panel only reads as glass if something is visible through it, so a near-black image makes the panel look like flat colour; images with light or colour in them keep the effect alive.

## Video on the web

- **Never GIF a video** — GIFs are limited to 256 colours and store every frame almost whole, so the same clip runs tens of megabytes; MP4 (H.264) is smaller, smoother, and plays everywhere.
- **Blur before you compress** — video codecs spend most of their space on fine detail, so blurring the footage during conversion made the file several times smaller. Since this clip lives behind a frosted panel anyway, the blur costs nothing visually. (129 MB phone clip → 756 KB.)
- **Hidden elements don't autoplay** — a video inside a `display: none` section may never start, so the routing calls `.play()` on the video belonging to the page being opened and pauses the rest, which also saves battery.
- **Muted is the price of autoplay** — browsers refuse to autoplay video with sound; `muted` plus `playsinline` is what makes a background video start on its own, including on phones.
- **`prefers-reduced-motion`** — some people set their system to reduce animation (often for motion sickness or migraines); this media query lets the page honour that by dropping the moving background.
- **A border underlines everything inside the element** — the links' underline is a `border-bottom`, which runs beneath *all* their content, so an arrow added inside sat on the line; moving it outside the link was the only clean way to lift it off.
- **Every child of a flex container becomes its own item** — dropping a loose arrow next to a link inside a flex *column* pushed it onto its own row; wrapping the pair in one span made them count as a single item again.
- **Line breaks only happen at spaces** — because the arrow is inserted with no whitespace before it, it can never wrap away from the end of its link.
- **`caret-color`** — one CSS property colours the blinking text cursor on its own, without touching the text.
- **Absolute centring needs all four sides at `0`** — `inset: 0` plus `margin: auto` centres an element in its parent, but setting even one side back to `auto` breaks it (this is exactly what went wrong with the list-view play button).
- **`min-width: 0` lets a flex item shrink** — flex items refuse to shrink below their content by default, so a long title would stretch the row instead of being clipped; `min-width: 0` is what permits the clipping.
- **CSS can't measure text** — deciding whether a title actually overflows has to happen in JavaScript (`scrollWidth` vs `clientWidth`); the script measures it, then hands CSS the distance to slide via a custom property.
- **Custom properties as a bridge** — `--marquee-shift` lets JavaScript pass a measured number into a CSS animation, keeping the movement itself in CSS where it belongs.

## Events and the player

- **Clicks travel upward** — a click on a button also counts as a click on everything containing it, so the new skip buttons were pausing playback via the bar's own play/pause handler until `stopPropagation()` stopped the click from carrying on up.
- **Sliders need the same protection** — the volume control sits inside the area that opens the queue, so its `click`, `mousedown` and `touchstart` all have to be stopped too, or dragging it would open the panel.
- **A range input can be styled to almost nothing** — `-webkit-slider-runnable-track` and `-webkit-slider-thumb` let a browser slider become a hairline with a small dot, matching the underlines used elsewhere.
- **Identical file paths confuse a playlist** — the player decides "is this the track already playing?" by comparing paths, so twelve placeholder tracks sharing one file made *next* look like *pause*. Distinct paths fixed it.
- **One pattern, used everywhere** — artwork-then-title is now the shape of a track in the page lists, the queue, and the bar; the same idea repeated is what makes separate features feel like one thing rather than several.
- **Look the data up, don't type it twice** — the queue and bar find a track's artwork by walking up to its album card (or a `data-art` on the playlist), so adding a track never means restating its picture.
- **Spacing should come from a scale** — 6px inside a group, 18px between groups; picking two numbers and reusing them is what separates deliberate spacing from spacing that "feels sloppy".
- **Consistency includes the small settings** — track names are uppercase in the cards, so they have to be uppercase in the queue and bar too, or the same content looks like different content.
- **A blurred element becomes a "backdrop root"** — anything nested *inside* an element that has `backdrop-filter` can only blur that element's own content, never the page behind it. The queue looked unblurred for exactly this reason; moving it out of the bar to be a sibling fixed it, and no amount of raising the blur value would have.
- **Moving an element changes what it's positioned against** — an ancestor with `backdrop-filter` also becomes the containing block for `position: fixed` descendants, so the queue had been positioning itself against the 50px bar rather than the window without anyone noticing.
- **`play()` doesn't take effect immediately** — it returns a promise, and `paused` stays true for a moment afterwards, so updating an icon right after the click left it a step behind. Listening for the audio's own `play` and `pause` events reads the real state instead of guessing when it changed.
- **Follow the thing itself, not the click** — the click is a request; the event is what actually happened. Anything showing state should listen to the state.
- **Moving an element loses whatever it inherited** — the queue's type size came from the bar it used to sit inside; once it became a sibling it fell back to the page's larger default and had to state the size itself.
- **`:focus-visible` vs `:focus`** — `:focus` fires on clicks too, so styling it puts a ring around every button you press; `:focus-visible` only fires when the browser judges a ring is needed (keyboard use), which is what you want.
- **Never delete a focus ring, replace it** — it's how someone navigating by keyboard sees where they are; the fix for an ugly default is a better-looking one, not `outline: none` alone.
- **Global keyboard shortcuts must yield to typing** — checking whether the event came from an input, textarea or contenteditable is what stops the space bar pausing music instead of typing a space in the email field.
- **Copy the pattern, don't blend patterns** — the welcome page row started as a hybrid (an album card *and* a playlist item), and every shared class collided: a stray black border, an underline stretching the row, text running together. Rebuilding it with Bespoke Sound's exact structure removed all three at once, and let three special-case rules be deleted.
- **`timeupdate`** — the audio element announces its own position a few times a second while playing; the progress line just listens rather than running a timer.
- **A range input can't tell CSS its value** — the filled part of the volume slider is drawn with a gradient whose stop comes from a custom property that JavaScript keeps up to date. (Firefox has `::-moz-range-progress` and needs no help.)
- **`closest()` walks up the tree** — asking a play button for its nearest `.page-section` is how the player works out which page a track came from, without anything having to be written down per track.
- **The page registry is a two-way map** — it lists which sections each page shows, so searching it backwards (which page lists *this* section?) turns an element back into a page name.
- **Decorative images get `alt=""`** — an empty alt (plus `aria-hidden`) tells a screen reader to skip it, which is right for a copy that carries no new information.
