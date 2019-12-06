'use strict';

const STATIC_CACHE_NAME = 'static-cache-v1';
const DATA_CACHE_NAME = 'data-cache-v1';

const FILES_TO_CACHE = [
	'/',
	'/index.html',
	'/manifest.json',
	'/css/design.css',
	'/js/main.js',
	'/images/icon.png',
	'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css',
	'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.2/css/all.min.css',
	'https://code.jquery.com/jquery-3.4.1.min.js',
	'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js',
	'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js',
	'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.2/webfonts/fa-solid-900.woff2',
	'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.2/webfonts/fa-regular-400.woff2'
];

self.addEventListener('install', function(event) {
	console.log('[ServiceWorker] Install');

	self.skipWaiting();

	event.waitUntil(
		caches.open(STATIC_CACHE_NAME).then((cache) => {
			console.log('[ServiceWorker] Pre-caching offline page');
			return cache.addAll(FILES_TO_CACHE);
		})
	);
});

self.addEventListener("activate", async (event) => {
	console.log('[ServiceWorker] Activate');

	event.waitUntil(
		caches.keys().then(function(keyList) {
			return Promise.all(keyList.map(function(key) {
				if (key !== STATIC_CACHE_NAME && key !== DATA_CACHE_NAME) {
					console.log('[ServiceWorker] Removing old cache', key);
					return caches.delete(key);
				}
			}));
		})
	);

	try {
		const applicationServerKey = urlB64ToUint8Array('BIJE-uGVbxNI7CAZPy8EPr2Ca0Cq_r7_h6FWdyTVTMeN_uX24Yc5AJsYoQaulGVrjpQvokMpjaIYj0U26VK88yY');
		const options = {applicationServerKey, userVisibleOnly: true};
		const subscription = await self.registration.pushManager.subscribe(options);
		const response = await saveSubscription(subscription);
		console.log(response);
	} catch (err) {
		console.log('Error', err);
	}

	self.clients.claim();
});

const saveSubscription = async subscription => {
	const SERVER_URL = 'http://localhost:8080/api/user/save-subscription';
	const response = await fetch(SERVER_URL, {
		method: 'post',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(subscription),
	});

	return response.json();
}

self.addEventListener('push', function(event) {
	if (event.data) {
		console.log("Push event:", event.data.text());
	}
	else {
		console.log("Push event without data");
	}
})

self.addEventListener('fetch', function(event) {
	//console.log('Fetch!', event.request);

	if (event.request.url.indexOf('/api/') > -1) {
	//if (event.request.url.indexOf('/api/')) {
		event.respondWith(async function() {
			const cache = await caches.open(DATA_CACHE_NAME);
			const cachedResponse = await cache.match(event.request);
			const networkResponsePromise = fetch(event.request);

			event.waitUntil(async function() {
				const networkResponse = await networkResponsePromise;
				await cache.put(event.request, networkResponse.clone());
			});

			return cachedResponse || networkResponsePromise;
		}());

		// Requesting dynamic data -> use "Cache then network" strategy
		/*event.respondWith(
			caches.open(DATA_CACHE_NAME).then(function(cache) {
				return fetch(event.request).then(function(response) {
					console.log(event.request.url, "-> api");
					cache.put(event.request.url, response.clone());
					return response
				})
			})
		);*/
	}
	else {
		//console.log("static call", event.request.url);
		// Requesting app shell files -> use "Cache, falling back to the network" strategy
		event.respondWith(
			caches.match(event.request).then(function(response) {
				if (response) {
					console.log(event.request.url, "-> static from cache");
					return response;
				}
				else {
					console.log(event.request.url, "-> static from network");
					return fetch(event.request);
				}

				//return response || fetch(event.request);
			})
		);
	}
});

self.addEventListener('notificationclick', function(event) {
	console.log("Notification click received");
	event.notification.close();
	if (event.action === 'yes') {
		// Archive action was clicked
		self.registration.showNotification("That Worked :-D!");
	}
	else {
		// Main body of notification was clicked
		//clients.openWindow('/inbox');
		console.log("something else");
	}
}, false);

// urlB64ToUint8Array is a magic function that will encode the base64 public key
// to Array buffer which is needed by the subscription option
const urlB64ToUint8Array = base64String => {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
	const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
	const rawData = atob(base64)
	const outputArray = new Uint8Array(rawData.length)
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i)
	}

	return outputArray
}
