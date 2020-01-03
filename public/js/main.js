let deferredPrompt = null;
let swRegistration = null;

$(document).ready(function() {
	try {
		registerServiceWorker();
		requestNotificationPermission();
	} catch (err) {
		console.log(err);
	}

	addGeneralHandlers();
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
	window.addEventListener('online', function() {
		if (navigator.onLine) {
			Object.keys(localStorage).forEach(name => {
				let entry = JSON.parse(localStorage[name]);
				localStorage.removeItem(name);

				if (entry.action == 'add') {
					addItem(name);
				}
				else if (entry.action == 'delete') {
					deleteItem(name);
				}
				else if (entry.action == 'checked') {
					setChecked(name, entry.checked);
				}
			});
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

	// Add item
	$("#search").on('submit', function(e) {
		e.preventDefault();

		// Capitalize item name
		let name = capitalize($(this).find('input').val());

		// Reset input
		this.reset();

		// Display item
		showItem(name, false);

		// Save item to backend
		addItem(name);
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

		let name = $(this).find('span.item-name').text();
		let checked = $(this).hasClass("item-done");

		setChecked(name, checked);
	});

	// Remove
	$(".item-remove").off('click').on('click', function() {
		let name = $(this).parent().find('.item-name').text();

		$(this).parent().remove();

		deleteItem(name);
	});
}

function showInstallButton() {
	if (!window.matchMedia('(display-mode: standalone)').matches ||
		window.navigator.standalone !== true)
	{
		$("#install").removeClass("hidden");
	}
}

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function addItem(name) {
	if (!navigator.onLine) {
		localStorage.setItem(name, JSON.stringify({action: 'add'}));
		return;
	}

	$.ajax({
		url: '/api/item',
		type: 'POST',
		data: {name: name},
		dataType: 'json'
	}).done(function(data) {
		console.log("success", data);
	}).fail(function(xhr, status, error) {
		console.log(error);
	});
}

function setChecked(name, checked) {
	if (!navigator.onLine) {
		localStorage.setItem(name, JSON.stringify({action: 'checked', checked: checked}));
		return;
	}

	$.ajax({
		url: '/api/item',
		type: 'PATCH',
		data: {name: name, checked: checked},
		dataType: 'json'
	}).done(function(data) {
		console.log(data);
	}).fail(function(xhr, status, err) {
		console.log(err);
	});
}

function deleteItem(name) {
	if (!navigator.onLine) {
		// Store in localStorage
		localStorage.setItem(name, JSON.stringify({action: "delete"}));
		return;
	}

	$.ajax({
		url: '/api/item',
		type: 'DELETE',
		data: {name: name},
		dataType: 'json'
	}).done(function(data) {
		console.log(data);
	}).fail(function(xhr, status, err) {
		console.log(err);
	});
}

function fetchItems() {
	let networkDataReceived = false;

	// Fetch network data
	let networkUpdate = fetch('/api/item').then(function(response) {
		return response.json();
	}).then(function(items) {
		networkDataReceived = true;
		displayItems(items);
	});

	// Fetch cached data
	caches.match('/api/item').then(function(response) {
		if (!response) throw Error("No data");
		return response.json();
	}).then(function(items) {
		// Only update if there was no network update (yet)
		if (!networkDataReceived) {
			displayItems(items);
		}
	}).catch(function() {
		return networkUpdate;
	}).catch(function() {
		console.log("There was an error");
	});
}

function displayItems(items) {
	// Remove existing items
	$(".items").empty();

	for (let name in items) {
		showItem(name, items[name]);
	}
}

function showItem(name, checked) {
	let item = document.createElement('li');
	let icon = document.createElement('i');

	if (checked) {
		item.className = "item-done";
		icon.className = "far fa-check-square";
	}
	else {
		icon.className = "far fa-square";
	}

	let nameDOM = document.createElement('span');
	nameDOM.className = "item-name";
	nameDOM.innerText = name;

	let remove = document.createElement('span');
	remove.className = "item-remove";
	remove.innerHTML = "&times;";

	item.appendChild(icon);
	item.appendChild(nameDOM);
	item.appendChild(remove);
	$('.items').append(item);

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

