// ============================================================================
// sw.js — the service worker
// ----------------------------------------------------------------------------
// This is what lets the app be ADDED TO A HOME SCREEN and opened without a
// browser around it. A browser will only offer to install a site that has a
// manifest and a service worker handling fetches, so the second half of that
// is this file.
//
// It is deliberately the simplest thing that qualifies: STALE-WHILE-REVALIDATE
// over the app's own files. Serve whatever is in the cache immediately (so a
// second visit opens instantly, and a bad connection on a train still opens),
// and fetch a fresh copy in the background for next time.
//
// WHY NOT SOMETHING CLEVERER: a service worker is a second copy of your app
// living in the browser, and every clever thing it does is a new way for
// someone to be stuck on an old version with no obvious way out. This one has
// no routing, no versioned asset lists to keep in step with the build, and no
// offline page. It caches what's asked for and it updates in the background.
//
// NOT WRITTEN IN TYPESCRIPT and not in src/: it must be served as a plain file
// from the site root scope, so it lives in public/ and is copied as-is.
// ============================================================================

// Bump this to throw away everything cached by an older worker. That's the
// escape hatch if a bad build ever gets cached.
const CACHE = 'fretboard-v1';

// Take over from an older worker immediately rather than waiting for every tab
// to close — otherwise a fix can sit undelivered for as long as one forgotten
// tab stays open.
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(Promise.resolve());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only GETs, and only this app's own origin. Anything else — the Google
  // Fonts stylesheet, the Kit subscribe POST — goes straight to the network.
  // Caching a POST would be wrong, and caching another origin's responses is
  // someone else's business to get right.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);

      // Refresh in the background whether or not there was a hit. A failure
      // here is normal — it's what being offline looks like — so it must never
      // reject into the response we're about to hand back.
      const fresh = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => undefined);

      // Something cached: use it now, and let the refresh land for next time.
      if (cached) return cached;

      // Nothing cached: wait for the network. If that fails too and this was a
      // navigation, fall back to the app shell — which is how a home-screen
      // launch still opens with no connection at all.
      const response = await fresh;
      if (response) return response;
      if (request.mode === 'navigate') {
        const shell = await cache.match('./');
        if (shell) return shell;
      }
      return Response.error();
    }),
  );
});
