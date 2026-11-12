// RETIRED. The app this worker used to cache has moved to its own address,
// https://fretboardconstellations.beingsound.studio/ — so this worker's only
// job is to remove itself. A visitor whose browser still has the old worker
// fetches this file on its next update check, installs it, and on activation
// it empties its caches, unregisters, and reloads any open tab — which then
// loads index.html in this folder and is forwarded to the new address.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
      await self.registration.unregister();
      const tabs = await self.clients.matchAll({ type: 'window' });
      tabs.forEach((tab) => tab.navigate(tab.url));
    })(),
  );
});
