// ============================================================
//  tracking.js — ad measurement (Meta + Google)
//
//  >>> THE TWO IDS TO FILL IN <<<
//  Nothing loads until an ID is pasted in below. With both left
//  empty this file only keeps ad links' tracking details (UTMs)
//  and passes them on to Cal, and every trackEvent() call is a
//  quiet no-op.
//
//  META_PIXEL_ID  — Meta Events Manager -> Data sources -> your
//                   pixel -> the number under its name.
//  GOOGLE_TAG_ID  — Google Ads -> Tools -> Google tag (starts AW-),
//                   or a Google Analytics 4 ID (starts G-).
//
//  Bookings themselves happen on Cal, so the "booked" conversion
//  is set up there: each Cal event type -> Apps -> Meta Pixel and
//  Google Analytics / Google Ads, with these same IDs.
//
//  Loaded before script.js and forms.js (see index.html) so the
//  ad details are read before the router tidies the address.
// ============================================================

const META_PIXEL_ID = "";
const GOOGLE_TAG_ID = "";

// ---- 1. Keep the ad link's details for this visit -------------
// An ad click arrives as e.g. /?page=sound-sessions&utm_source=instagram.
// We keep the utm_* values (and Meta's / Google's click IDs) for the
// rest of the visit, so a booking made three pages later still says
// which ad it came from.
var AD_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"];
var LANDING_URL = window.location.href;

var adDetails = (function () {
  var saved = {};
  try { saved = JSON.parse(sessionStorage.getItem("bs-ad-details") || "{}"); } catch (e) { saved = {}; }
  var query = new URLSearchParams(window.location.search);
  var fresh = false;
  AD_PARAMS.forEach(function (key) {
    if (query.get(key)) { saved[key] = query.get(key); fresh = true; }
  });
  if (fresh) {
    try { sessionStorage.setItem("bs-ad-details", JSON.stringify(saved)); } catch (e) { /* private mode: keep for this page only */ }
  }
  return saved;
})();

// ---- 2. The tags, only when an ID is set ----------------------
if (META_PIXEL_ID) {
  // Meta's standard pixel snippet.
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  window.fbq("init", META_PIXEL_ID);
}

if (GOOGLE_TAG_ID) {
  var gtagScript = document.createElement("script");
  gtagScript.async = true;
  gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GOOGLE_TAG_ID);
  document.head.appendChild(gtagScript);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  // Page views are sent by trackPageView() below, because this site
  // changes pages without reloading. page_location is the address the
  // visitor actually landed on, ad details included.
  window.gtag("config", GOOGLE_TAG_ID, { send_page_view: false, page_location: LANDING_URL });
}

// ---- 3. What the rest of the site calls -----------------------
// A page was shown (script.js calls this from navigateToPage).
var firstPageView = true;
function trackPageView(path, title) {
  if (window.fbq) { window.fbq("track", "PageView"); }
  if (window.gtag) {
    window.gtag("event", "page_view", {
      page_location: firstPageView ? LANDING_URL : window.location.origin + path,
      page_title: title,
    });
  }
  firstPageView = false;
}

// Something worth counting happened: an email signup, a booking click.
// Meta has fixed names for the common ones ("Lead"); anything else is
// sent as a custom event. Google takes any name.
var META_STANDARD = { Lead: true, Schedule: true, Contact: true, ViewContent: true };
function trackEvent(name, details) {
  details = details || {};
  if (window.fbq) {
    window.fbq(META_STANDARD[name] ? "track" : "trackCustom", name, details);
  }
  if (window.gtag) {
    window.gtag("event", name === "Lead" ? "generate_lead" : name, details);
  }
}

// ---- 4. Booking links carry the ad details to Cal -------------
// Cal keeps utm_* values on the booking, so you can see which ad a
// booking came from. Also counts the click itself as "BookingClick".
document.addEventListener("click", function (event) {
  var link = event.target.closest && event.target.closest('a[href*="cal.com/"]');
  if (!link) return;
  try {
    var url = new URL(link.href);
    Object.keys(adDetails).forEach(function (key) {
      if (key.indexOf("utm_") === 0 && !url.searchParams.has(key)) {
        url.searchParams.set(key, adDetails[key]);
      }
    });
    link.href = url.toString();
    trackEvent("BookingClick", { booking: url.pathname.split("/").pop() });
  } catch (e) { /* leave the link as it was */ }
}, true);
