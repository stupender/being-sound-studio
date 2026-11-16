// ============================================================
//  forms.js — email capture ("the front door")
//
//  Every <form class="capture-form"> on the site is wired up here.
//  A form sends one email address to our list backend (Kit), then
//  either shows the hidden welcome page or an inline "You're in."
//
//  >>> THE ONE PLACE TO CHANGE THE BACKEND <<<
//  If we ever switch away from Kit, edit KIT_FORM_ENDPOINT below.
//  It is a PUBLIC form URL — there is NO secret key in this file,
//  so it is safe to sit here in plain sight. The worst anyone can
//  do with it is subscribe to the newsletter.
// ============================================================

// The Kit form endpoint. The number is the form ID from Kit.
// (Kit -> Forms -> open the form -> the number in the address bar.)
const KIT_FORM_ENDPOINT = "https://app.kit.com/forms/9739307/subscriptions";

// A simple, forgiving email check: something@something.something
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Wire up every capture form on the page. They all share this code; the
// app gates (further down) are built by script and wired the same way.
document.querySelectorAll(".capture-form").forEach(wireCaptureForm);

function wireCaptureForm(form) {
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // never let the browser do its own submit + page reload

    var message = form.querySelector(".capture-message");
    var button = form.querySelector(".capture-button");
    var emailField = form.querySelector('input[name="email_address"]');
    var honeypot = form.querySelector(".capture-hp");

    // 1. Honeypot: a field hidden from people (see .capture-hp in styles.css).
    //    Bots fill in every field they find. If it has anything in it, a bot
    //    filled it — so we pretend all is well and quietly stop.
    if (honeypot && honeypot.value) {
      return;
    }

    // 2. Basic email validation, with a friendly message instead of a browser popup.
    var email = (emailField.value || "").trim();
    if (!EMAIL_PATTERN.test(email)) {
      showMessage(message, "Please enter a valid email address.", true);
      return;
    }

    // 3. Send it. Build a form-encoded body (the format Kit's own form uses):
    //    email_address, plus a hidden 'source' so we can tell which door someone
    //    came through (listen / loop / footer) when we look at them in Kit.
    var body = new URLSearchParams();
    body.set("email_address", email);
    if (form.dataset.source) {
      body.set("fields[source]", form.dataset.source);
    }

    if (button) { button.disabled = true; }
    showMessage(message, "Sending…", false);

    fetch(KIT_FORM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Ask Kit for a JSON reply. (Without this it returns an HTML page.)
        "Accept": "application/json",
      },
      body: body.toString(),
    })
      .then(function (response) {
        // Kit answers 200 when the email is accepted. We don't need anything
        // from the reply body, so we don't parse it — we just check it's OK.
        if (!response.ok) { throw new Error("Bad response from backend"); }

        // Count the signup for ads, if a tag is set up (tracking.js).
        if (typeof trackEvent === "function") {
          trackEvent("Lead", { source: form.dataset.source || "unknown" });
        }

        // Success. Three possible behaviours, chosen by data- attributes on the form:
        if (form.dataset.success === "unlock") {
          // An app gate: open the apps for this visitor (see below).
          unlockApps(form);
        } else if (form.dataset.success === "redirect" && form.dataset.redirect) {
          // Show the hidden welcome page, without reloading, so the freebie can
          // stream immediately. navigateToPage() lives in script.js.
          if (typeof navigateToPage === "function") {
            navigateToPage(form.dataset.redirect);
          } else {
            // Fallback if routing isn't available: e.g. "listen-welcome" -> "/listen/welcome"
            window.location.assign("/" + form.dataset.redirect.replace("-", "/"));
          }
        } else {
          // Inline confirmation (used by the footer — no page change).
          form.reset();
          showMessage(message, form.dataset.successMessage || "You're in.", false);
        }
      })
      .catch(function () {
        showMessage(message, "Something went wrong. Please try again.", true);
      })
      .finally(function () {
        if (button) { button.disabled = false; }
      });
  });
}

// ============================================================
//  App gate
//  The apps are free, but the first time someone opens one from this
//  site they leave their email. Clicking an app's picture or name
//  opens a one-line signup in its card; once they're signed up the
//  link opens, and it stays open on that browser from then on.
//
//  The links in the HTML are ordinary links, so with JavaScript off
//  they simply work. On the apps' own sites there's no gate: their
//  mailing-list bar is optional there.
//
//  To gate another app, add its address to APPS.
// ============================================================
var APPS = {
  "soundscapes.beingsound.studio": { name: "Soundscape", source: "app-soundscape" },
  "fretboardconstellations.beingsound.studio": { name: "Fretboard Constellations", source: "app-fretboard" },
};
var UNLOCK_KEY = "bs-apps-unlocked";
var appsUnlocked = false;
try { appsUnlocked = localStorage.getItem(UNLOCK_KEY) === "yes"; } catch (e) { /* storage blocked: ask once per visit */ }

function appFor(link) {
  return link && link.hostname ? APPS[link.hostname] : null;
}

// Build one gate form per app card. Made with DOM methods (no innerHTML),
// so nothing from the page is ever read as markup.
document.querySelectorAll(".album-card").forEach(function (card) {
  var link = Array.prototype.find.call(card.querySelectorAll("a[href]"), appFor);
  var info = card.querySelector(".album-card-info");
  if (!link || !info) return;
  var app = appFor(link);

  var form = document.createElement("form");
  form.className = "capture-form capture-form-inline app-gate";
  form.dataset.source = app.source;
  form.dataset.success = "unlock";
  form.dataset.appUrl = link.href;
  form.dataset.appName = app.name;
  form.noValidate = true;
  form.hidden = true;

  var text = document.createElement("p");
  text.className = "app-gate-text";
  text.textContent = "Free to use. Leave your email and the link opens right here.";

  var honeypot = document.createElement("input");
  honeypot.type = "text";
  honeypot.className = "capture-hp";
  honeypot.name = "website";
  honeypot.tabIndex = -1;
  honeypot.autocomplete = "off";
  honeypot.setAttribute("aria-hidden", "true");

  var id = "gate-" + app.source + "-" + Math.random().toString(36).slice(2, 7);
  var label = document.createElement("label");
  label.className = "capture-label";
  label.htmlFor = id;
  label.textContent = "Email address";

  var email = document.createElement("input");
  email.type = "email";
  email.id = id;
  email.name = "email_address";
  email.className = "capture-input";
  email.placeholder = "you@example.com";
  email.required = true;
  email.autocomplete = "email";

  var button = document.createElement("button");
  button.type = "submit";
  button.className = "button-link capture-button";
  button.textContent = "Get the link";

  var message = document.createElement("p");
  message.className = "capture-message";
  message.setAttribute("role", "status");
  message.setAttribute("aria-live", "polite");

  [text, honeypot, label, email, button, message].forEach(function (el) { form.appendChild(el); });
  info.appendChild(form);
  wireCaptureForm(form);
});

// A click on an app link before signing up opens that card's gate instead.
document.addEventListener("click", function (event) {
  if (appsUnlocked) return;
  var link = event.target.closest && event.target.closest("a[href]");
  if (!appFor(link)) return;
  var card = link.closest(".album-card");
  var gate = card && card.querySelector(".app-gate");
  if (!gate) return; // not in a card: let it through
  event.preventDefault();
  gate.hidden = false;
  var field = gate.querySelector(".capture-input");
  if (field) { field.focus({ preventScroll: true }); }
  gate.scrollIntoView({ block: "nearest", behavior: "smooth" });
});

// Signed up: open every app for this visitor, and put a plain link to the
// app they asked for where the form was (opening it ourselves after the
// wait would be blocked as a pop-up).
function unlockApps(form) {
  appsUnlocked = true;
  try { localStorage.setItem(UNLOCK_KEY, "yes"); } catch (e) { /* this visit only */ }
  document.querySelectorAll(".app-gate").forEach(function (gate) {
    gate.hidden = true;
  });
  var done = document.createElement("p");
  done.className = "app-gate-open";
  done.appendChild(document.createTextNode("You're in. "));
  var open = document.createElement("a");
  open.href = form.dataset.appUrl;
  open.target = "_blank";
  open.rel = "noopener noreferrer";
  open.textContent = "Open " + form.dataset.appName;
  done.appendChild(open);
  form.parentNode.insertBefore(done, form.nextSibling);
}

// Small helper: show a status or error message under a form.
function showMessage(el, text, isError) {
  if (!el) { return; }
  el.textContent = text;
  el.classList.toggle("capture-message-error", !!isError);
}

// ============================================================
//  Outbound-link markers
//  Adds a small arrow to links that leave the site, so clicking
//  one is never a surprise. Text links only — image thumbnails
//  and buttons are skipped, since an arrow would clutter them.
// ============================================================
// Absolute links, plus any link explicitly opted in with data-outbound —
// a root-relative href never starts with "http", so it would otherwise
// never be considered.
document.querySelectorAll('a[href^="http"], a[data-outbound]').forEach(function (link) {
  var isInternal = link.hostname === window.location.hostname;
  var isButton = link.classList.contains("button-link");
  // A picture-only link (thumbnail, looping clip or inline SVG mark) gets no
  // arrow either.
  var isThumbnail = !!link.querySelector("img, svg, video");

  // A same-domain link can still be an outbound-feeling one — the Fretboard
  // app opens in its own tab. data-outbound opts it in explicitly.
  var optedIn = link.hasAttribute("data-outbound");

  if ((!isInternal || optedIn) && !isButton && !isThumbnail) {
    link.classList.add("external-link");
    // Security: stops the new tab from being able to touch this page.
    link.setAttribute("rel", "noopener noreferrer");

    // The arrow goes *after* the link rather than inside it, because the
    // link's underline is a border along its whole box — an arrow placed
    // inside would sit on that underline.
    //
    // Link and arrow are then wrapped together in one span. Some of these
    // links live in flex columns, where a loose arrow would be treated as
    // its own item and drop to the line below; inside the wrapper the pair
    // counts as one thing. There's no space between them in the HTML, so
    // there's nowhere for a line break to fall either.
    //
    // aria-hidden keeps screen readers from announcing the icon.
    //
    // The icon is drawn as an SVG rather than typed as a text character.
    // A character like ↗ is supplied by whatever font the visitor happens
    // to have, so it lands at a different weight and height on every
    // machine. This is drawn by us, so it looks the same everywhere, and
    // "currentColor" means it is painted in whatever colour the text
    // around it is — no colour to keep in sync.
    //
    // The markup below is a fixed string with nothing from the page in it,
    // so setting it with innerHTML is safe.
    var arrow = document.createElement("span");
    arrow.className = "external-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      // The open-cornered box.
      '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>' +
      // The arrowhead, and the shaft leaving through the open corner.
      '<polyline points="15 3 21 3 21 9"/>' +
      '<line x1="10" y1="14" x2="21" y2="3"/>' +
      "</svg>";

    var wrapper = document.createElement("span");
    wrapper.className = "external-wrap";
    link.parentNode.insertBefore(wrapper, link);
    wrapper.appendChild(link);
    wrapper.appendChild(arrow);
  }
});

// ============================================================
//  Marquee for clipped list text
//  In list view a long title is cut off rather than wrapped. When you
//  hover a row we check whether its text actually overflows, and only
//  then slide it — out to show the end, then back again.
//
//  The check happens on hover rather than at page load because these
//  rows start on hidden pages, and a hidden element reports zero width,
//  which would make every title look like it overflowed.
// ============================================================
function setUpMarquees() {
  document
    .querySelectorAll(".album-list .album-card-title, .album-list .album-card-meta")
    .forEach(function (box) {
      // Wrap the contents once, so there's something to slide.
      if (!box.querySelector(".marquee-inner")) {
        var inner = document.createElement("span");
        inner.className = "marquee-inner";
        while (box.firstChild) { inner.appendChild(box.firstChild); }
        box.appendChild(inner);
      }

      var row = box.closest(".album-card");
      if (!row || row.dataset.marqueeReady) return;
      row.dataset.marqueeReady = "yes";

      // Measure at the moment of hovering, when the row is definitely visible.
      row.addEventListener("mouseenter", function () {
        row.querySelectorAll(".album-card-title, .album-card-meta").forEach(function (field) {
          var text = field.querySelector(".marquee-inner");
          if (!text) return;

          var overflow = text.scrollWidth - field.clientWidth;

          if (overflow > 1) {
            field.classList.add("is-overflowing");
            field.style.setProperty("--marquee-shift", "-" + overflow + "px");
            // Roughly a steady reading speed, with time at each end.
            field.style.setProperty("--marquee-time", Math.max(3, overflow / 25) + "s");
          } else {
            field.classList.remove("is-overflowing");
            field.style.removeProperty("--marquee-shift");
          }
        });
      });
    });
}

setUpMarquees();
