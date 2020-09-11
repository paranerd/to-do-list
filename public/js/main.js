let deferredPrompt = null;
let swRegistration = null;
let items = [];
const apiUrl = '/api/item';
const api = new Api();
const cache = new Cache();

$(document).ready(async function() {
	try {
		registerServiceWorker();
		requestNotificationPermission();
	} catch (err) {
		console.log(err);
	}

	addGeneralHandlers();
	await cache.sync();
	fetchItems();
	showInstallButton();
});

/**
 * Register Service Worker
 *
 * @throws Error
 */
function registerServiceWorker() {
	if ('serviceWorker' in navigator) {
		window.addEventListener('load', function() {
			navigator.serviceWorker.register('service-worker.js').then(function(registration) {
				// Registration was successful
				console.log("[ServiceWorker] Registered")
				swRegistration = registration;

				navigator.serviceWorker.addEventListener("message", handleSWMessage);
			}).catch(function(err) {
				console.log(err);
			});
		});
	}
	else {
		throw new Error('Service Worker is not supported');
	}
}

/**
 * Add general click handlers
 */
function addGeneralHandlers() {
	// When the browser switches from offline to online, push any cached actions
	window.addEventListener('online', async function() {
		if (navigator.onLine) {
			await cache.sync();
			fetchItems();
		}
	});

	// Catch the "install app" prompt and store it to be triggered later
	window.addEventListener('beforeinstallprompt', e => {
		e.preventDefault();
		deferredPrompt = e;
		return false;
	});

	// Trigger app installation
	$("#install").on('click', function() {
		deferredPrompt.prompt();
		deferredPrompt.userChoice.then(choice => {
			console.log(choice);
		});

		deferredPrompt = null;
	});

	// Create item
	$("#create-item").on('submit', function(e) {
		e.preventDefault();

		// Capitalize item name
		const name = capitalize($(this).find('input').val());

		// Reset input
		this.reset();

		// Save item to backend
		createItem(name);
	});
}

/**
 * Add handlers for item-clicks
 */
function addItemClickHandlers() {
	// Toggle checked
	$(".items li").off('click').on('click', function(e) {
		if ($(e.target).is('.item-remove')) {
			return;
		}

		$(this).find('i').toggleClass("fa-square");
		$(this).find('i').toggleClass("fa-check-square");
		$(this).toggleClass("item-done");

		const id = $(this).data('id');
		const done = $(this).hasClass("item-done");

		updateItem(id, done);
	});

	// Remove
	$(".item-remove").off('click').on('click', function() {
		const id = $(this).parent().data('id');

		$(this).parent().remove();

		deleteItem(id);
	});
}

/**
 * Show install button
 */
function showInstallButton() {
	if (!window.matchMedia('(display-mode: standalone)').matches ||
		window.navigator.standalone !== true)
	{
		$("#install").removeClass("hidden");
	}
}

/**
 * Capitalize string
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Create item
 * @param {string} name
 */
async function createItem(name) {
	try {
		const item = await api.create(name)
		items.push(item);
	} catch (e) {
		const item = cache.create(name);
		items.push(item);
	} finally {
		displayItems();
	}
}

/**
 * Update item status
 * @param {string} id
 * @param {boolean} done
 */
async function updateItem(id, done) {
	let item = getItemById(id);

	try {
		// Try updating on the server
		item = await api.update(id, done);
	} catch (e) {
		// Save the update for later instead
		item = cache.update(item, done);
	}
	finally {
		// Update items array
		for (let i = 0; i < items.length; i++) {
			if (items[i].id === id) {
				items[i] = item;
				break;
			}
		}

		// Display updated items
		displayItems();
	}
}

/**
 * Delete item
 * @param {string} id
 */
async function deleteItem(id) {
	let item = getItemById(id);

	try {
		// Try deleting on the server
		await api.delete(id);
	} catch (e) {
		// Save deletion for later instead
		item = cache.delete(item);
	} finally {
		// Update items array
		for (let i = 0; i < items.length; i++) {
			if (items[i].id === id) {
				items.splice(i, 1);
				break;
			}
		}

		// Display updated items
		displayItems();
	}
}

/**
 * Fetch items from network or cache if unavailable
 */
function fetchItems() {
	let networkDataReceived = false;

	// Fetch network data
	let networkUpdate = fetch(apiUrl).then(function(response) {
		return response.json();
	}).then(function(data) {
		networkDataReceived = true;
		items = data;
		displayItems();
	});

	// Fetch cached data
	caches.match(apiUrl).then(function(response) {
		if (!response) throw Error("No data");
		return response.json();
	}).then(function(data) {
		// Only update if there was no network update (yet)
		if (!networkDataReceived) {
			items = data;
			displayItems();
		}
	}).catch(function() {
		return networkUpdate;
	}).catch(function() {
		console.log("Error fetching data");
	});
}

/**
 * Build items list
 */
function displayItems() {
	// Remove existing items
	$(".items").empty();

	for (let item of items) {
		showItem(item);
	}
}

/**
 * Create item DOM
 * @param {Item} item
 */
function showItem(item) {
	let itemDOM = document.createElement('li');
	let icon = document.createElement('i');

	if (item.done) {
		itemDOM.className = "item-done";
		icon.className = "far fa-check-square";
	}
	else {
		icon.className = "far fa-square";
	}

	let nameDOM = document.createElement('span');
	nameDOM.className = "item-name";
	nameDOM.innerText = item.name;

	let remove = document.createElement('span');
	remove.className = "item-remove";
	remove.innerHTML = "&times;";

	itemDOM.appendChild(icon);
	itemDOM.appendChild(nameDOM);
	itemDOM.appendChild(remove);
	itemDOM.setAttribute('data-id', item.id);
	$('.items').append(itemDOM);

	addItemClickHandlers();
}

/**
 * Handle messages from Service Worker
 *
 * @param event e
 */
function handleSWMessage(e) {
	console.log(`Navigator SW received a msg: ${e.data}`);
	location.reload();
}

/**
 * Request permission to display notifications
 *
 * @throws Error
 */
async function requestNotificationPermission() {
	if (!("Notification" in window)) {
		throw new Error("Notifications not supported.");
	}
	else if (Notification.permission === "granted") {
		return;
	}
	else if (Notification.permission !== "denied") {
		Notification.requestPermission(function(status) {
			if (status !== "granted") {
				throw new Error("Notification permission denied");
			}
		});
	}
}

/**
 * Get item by ID
 * @param {string} id
 * @returns {Item}
 */
function getItemById(id) {
	for (let item of items) {
		if (item.id === id) {
			return item;
		}
	}

	return null;
}