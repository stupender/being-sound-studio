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

// Wire up every capture form on the page. There may be one (on /listen),
// or several (once /loop and the footer are added) — they all share this code.
document.querySelectorAll(".capture-form").forEach(function (form) {
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

        // Success. Two possible behaviours, chosen by data- attributes on the form:
        if (form.dataset.success === "redirect" && form.dataset.redirect) {
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
});

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
document.querySelectorAll('a[href^="http"]').forEach(function (link) {
  var isInternal = link.hostname === window.location.hostname;
  var isButton = link.classList.contains("button-link");
  var isThumbnail = !!link.querySelector("img");

  if (!isInternal && !isButton && !isThumbnail) {
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
    // aria-hidden keeps screen readers from announcing the arrow as text.
    var arrow = document.createElement("span");
    arrow.className = "external-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";

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
