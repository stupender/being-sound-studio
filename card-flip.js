/* =====================================================================
   CARD FLIP
   Turns a card's artwork over to show a short back side about the work.

   Deliberately opt-in and additive: it builds the back face from content
   already in the markup (type, title, meta) plus an optional data-back
   sentence on the .album-card element. It never invents copy — a card
   with no data-back simply shows what the front already said, plus its
   link.

   The artwork stays a link, so flipping is its own small control in the
   corner rather than a click on the image. Keyboard reachable, and it
   respects prefers-reduced-motion (the CSS drops the rotation there).
   ===================================================================== */
(function () {
    'use strict';

    function buildBack(card) {
        var back = document.createElement('div');
        back.className = 'album-card-face album-card-back';

        var inner = document.createElement('div');
        inner.className = 'album-card-back-inner';

        function copyOf(sel, cls) {
            var el = card.querySelector(sel);
            if (!el) { return null; }
            var p = document.createElement('p');
            p.className = cls;
            p.textContent = el.textContent.trim();
            return p;
        }

        var type = copyOf('.album-card-type', 'album-card-back-type');
        if (type) { inner.appendChild(type); }

        var title = copyOf('.album-card-title', 'album-card-back-title');
        if (title) { inner.appendChild(title); }

        // The one slot for real prose. Supplied per-card in the markup as
        // data-back="…"; absent until there is copy to put there.
        if (card.dataset.back) {
            var note = document.createElement('p');
            note.className = 'album-card-back-note';
            note.textContent = card.dataset.back;
            inner.appendChild(note);
        }

        var meta = copyOf('.album-card-meta', 'album-card-back-meta');
        if (meta) { inner.appendChild(meta); }

        // Carry the card's own destination through to the back.
        var link = card.querySelector('.album-card-title a, .album-card-thumb-link');
        if (link && link.href) {
            var a = document.createElement('a');
            a.className = 'album-card-back-link';
            a.href = link.href;
            if (link.target) { a.target = link.target; a.rel = 'noopener'; }
            a.textContent = 'Open';
            inner.appendChild(a);
        }

        back.appendChild(inner);
        return back;
    }

    function enhance(card) {
        var box = card.querySelector('.album-card-image');
        if (!box || box.querySelector('.album-card-flip')) { return; }
        if (!card.querySelector('.album-card-title')) { return; }

        var flip = document.createElement('div');
        flip.className = 'album-card-flip';

        var front = document.createElement('div');
        front.className = 'album-card-face album-card-front';
        while (box.firstChild) { front.appendChild(box.firstChild); }

        flip.appendChild(front);
        flip.appendChild(buildBack(card));
        box.appendChild(flip);

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'album-card-flip-toggle';
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'About this work');
        btn.textContent = 'i';
        box.appendChild(btn);

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var open = card.classList.toggle('is-flipped');
            btn.setAttribute('aria-expanded', String(open));
            btn.setAttribute('aria-label', open ? 'Back to the artwork' : 'About this work');
            btn.textContent = open ? '✕' : 'i';
            // The hidden face must not be reachable by keyboard.
            front.querySelectorAll('a, button').forEach(function (el) {
                el.tabIndex = open ? -1 : 0;
            });
        });

        // Esc turns the card back over.
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && card.classList.contains('is-flipped')) {
                btn.click();
                btn.focus();
            }
        });
    }

    function run() {
        document.querySelectorAll('.album-card').forEach(enhance);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }

    // Cards are filtered/injected as the page switches views, so re-run
    // when the card grids change.
    var mo = new MutationObserver(function () { run(); });
    mo.observe(document.body, { childList: true, subtree: true });
})();
