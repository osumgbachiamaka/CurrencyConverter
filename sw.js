self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('v4').then(cache => cache.addAll([
            './',
            './index.html',
            './js/main.js',
            'https://free.currencyconverterapi.com/api/v5/currencies',
            'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
            'https://cdn.jsdelivr.net/npm/idb-keyval@3/dist/idb-keyval-iife.min.js'
        ]))
    );
});

// attach a fetch event listener to the service worker,
// then call the respondWith() method on the event to hijack HTTP responses
self.addEventListener('fetch', event => {
    event.respondWith(caches.match(event.request).then(response => {
        // caches.match() always resolves
        // but in case of success response will have value
        if (response !== undefined) {
            return response;
        } else {
            return fetch(event.request).then(response => {
                // response may be used only once
                // we need to save clone to put one copy in cache
                // and serve second one
                let responseClone = response.clone();

                caches.open('v4').then(cache => {
                    cache.put(event.request, responseClone);
                });
                return response;
            }).catch(() => // return Response;
                new Response('Something went wrong :('));
        }
    }));
});

// activate
self.addEventListener('activate', event => {
    const cacheWhitelist = ['v4'];

    event.waitUntil(
        caches.keys().then(keyList => Promise.all(keyList.map(key => {
            if (!cacheWhitelist.includes(key)) {
                return caches.delete(key);
            }
        })))
    );
});