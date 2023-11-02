self.importScripts('js/cookie.js');
self.importScripts('js/ws.js');

self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open('v1').then(function(cache) {
			return cache.addAll([
				'/brunch-mac-pwa/',
				'/brunch-mac-pwa/index.html',
				'/brunch-mac-pwa/css/style.css',
				'/brunch-mac-pwa/html/addons.html',
				'/brunch-mac-pwa/html/chromeos.html',
				'/brunch-mac-pwa/html/settings.html',
				'/brunch-mac-pwa/images/background/background.png',
				'/brunch-mac-pwa/images/icons/48.png',
				'/brunch-mac-pwa/images/icons/96.png',
				'/brunch-mac-pwa/images/icons/144.png',
				'/brunch-mac-pwa/images/icons/192.png',
				'/brunch-mac-pwa/images/icons/256.png',
				'/brunch-mac-pwa/images/icons/384.png',
				'/brunch-mac-pwa/images/icons/512.png',
				'/brunch-mac-pwa/js/addons.js',
				'/brunch-mac-pwa/js/brunch.js',
				'/brunch-mac-pwa/js/chromeos.js',
				'/brunch-mac-pwa/js/cookie.js',
				'/brunch-mac-pwa/js/settings.js',
				'/brunch-mac-pwa/js/ws.js'
			]);
		})
	);
});

self.addEventListener('fetch', function(event) {
	event.respondWith(
		fetch(event.request).catch(function() {
			return caches.match(event.request);
		})
	);
});

const getversion = async () => {
	console.log('In periodicsync handler');
	ws_connect();
	setTimeout(() => { ws.send("latest\nlatest-chromeos"); }, 2000);
};

self.addEventListener('periodicsync', event => {
	console.log('syncing started.');
	if (event.tag == 'get-latest-version') {
		event.waitUntil(getversion());
	}
});

self.addEventListener('notificationclick', function (event) {
	console.log(event.notification.data.tab);
	const rootUrl = new URL('/brunch-mac-pwa/', location).href;
	var targetUrl;
	if (event.notification.data.tab === "brunch") {
		targetUrl = new URL('/brunch-mac-pwa/', location).href;
	} else {
		targetUrl = new URL('/brunch-mac-pwa/html/' + event.notification.data.tab + '.html', location).href;
	}
	event.waitUntil(
		clients.matchAll().then(matchedClients => {
			for (let client of matchedClients) {
				return client.focus();
			}
			return clients.openWindow(targetUrl);
		})
	);
});
