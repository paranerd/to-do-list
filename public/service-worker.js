'use strict';

const STATIC_CACHE_NAME = 'static-cache-v1';
const DATA_CACHE_NAME = 'data-cache-v1';
const SERVER_KEY = 'BM6_KGkGtIOZB5tJICG3SL9-ua0LP3KCnQHTf5yPnbn3imqbNyjoy-OpW1e-XIKOwdHOKUpA2Zebi6VSWTK6qAQ';

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
		const applicationServerKey = urlB64ToUint8Array(SERVER_KEY);
		const options = {applicationServerKey, userVisibleOnly: true};
		const subscription = await self.registration.pushManager.subscribe(options);
		const response = await saveSubscription(subscription);
	} catch (err) {
		console.log('[ServiceWorker] Error', err);
	}

	self.clients.claim();
});

self.addEventListener('fetch', async function(event) {
	// Caching strategies:
	// https://developers.google.com/web/ilt/pwa/caching-files-with-service-worker
	if (event.request.method == 'GET' && event.request.url.indexOf('/api/') > -1) {
		// Requesting dynamic data -> use "Cache then network" strategy
		event.respondWith(
			caches.open(DATA_CACHE_NAME).then(async function(cache) {
				const response = await fetch(event.request);
				cache.put(event.request, response.clone());
				return response;
			})
		);
	}
	else if (event.request.method != 'GET' && event.request.url.indexOf('/api/') > -1) {
		// API call other than GET -> add some header; just for knowledgebase's sake
		event.respondWith(addHeader(event));
	}
	else {
		// Requesting app shell files -> use "Cache, falling back to the network" strategy
		event.respondWith(async function() {
			const response = await caches.match(event.request);
			return response || fetch(event.request);
		}());
	}
});

self.addEventListener('push', function(event) {
	if (event.data) {
		clients.matchAll().then(function(clients) {
			clients.forEach(function(client) {
				client.postMessage('Push message came in: ' + event.data.text());
			});
		});

		console.log("[ServiceWorker] Push event:", event.data.text());
		self.registration.showNotification("To-Do List updated", {
			icon: "images/icon.png",
			body: event.data.text(),
			actions: [
				{
					action: 'clickme',
					title: 'Click Me!'
				}
			]
		});
	}
});

self.addEventListener('notificationclick', function(event) {
	console.log(event);
	event.notification.close();

	if (event.action === 'clickme') {
		// clickme action was clicked
		self.registration.showNotification("That Worked :-D!");
	}
	else {
		// Main body of notification was clicked
		clients.openWindow('/');
	}
}, false);

async function saveSubscription(subscription) {
	const response = await fetch('/api/user/save-subscription', {
		method: 'post',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(subscription),
	});

	return response.json();
}

// urlB64ToUint8Array is a magic function that will encode the base64 public key
// to Array buffer which is needed by the subscription option
function urlB64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
	const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
	const rawData = atob(base64)
	const outputArray = new Uint8Array(rawData.length)

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i)
	}

	return outputArray
}

function addHeader(event) {
	const request = new Request(event.request);
	request.headers.set('x-my-custom-header', "This is some important value!");

	return fetch(request);
}

