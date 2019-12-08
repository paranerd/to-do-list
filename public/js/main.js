let deferredPrompt = null;
let swRegistration = null;

$(document).ready(function() {
	addClickHandler();
	loadItems();
	showInstallButton();
});

function showInstallButton() {
	if (!window.matchMedia('(display-mode: standalone)').matches ||
		window.navigator.standalone !== true)
	{
		$("#install").removeClass("hidden");
	}
}

function addClickHandler() {
	$(".items li").off('click').on('click', function(e) {
		if ($(e.target).is('.item-remove')) {
			return;
		}

		$(this).find('i').toggleClass("fa-square");
		$(this).find('i').toggleClass("fa-check-square");
		$(this).toggleClass("item-done");

		let name = $(this).find('span.item-name').text();
		let checked = $(this).hasClass("item-done");

		if (navigator.onLine) {
			setChecked(name, checked);
		}
		else {
			localStorage.setItem(name, JSON.stringify({action: 'checked', checked: checked}));
		}
	});

	$(".item-remove").off('click').on('click', function() {
		let name = $(this).parent().find('.item-name').text();

		$(this).parent().remove();

		if (navigator.onLine) {
			deleteItem(name);
		}
		else {
			// Store in localStorage
			localStorage.setItem(name, JSON.stringify({action: "delete"}));
		}
	});
}

function setChecked(name, checked) {
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

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function loadItems() {
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

function addItem(name) {
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

$("#search").on('submit', function(e) {
	e.preventDefault();

	let name = capitalize($(this).find('input').val());

	this.reset();

	showItem(name, false);

	if (navigator.onLine) {
		addItem(name);
	}
	else {
		localStorage.setItem(name, JSON.stringify({action: 'add'}));
	}
});

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

	addClickHandler();
}

function removeItem(name) {
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

if ('serviceWorker' in navigator) {
	window.addEventListener('load', function() {
		navigator.serviceWorker.register('service-worker.js').then(function(registration) {
			// Registration was successful
			console.log("[ServiceWorker] Registered")
			swRegistration = registration;
			//notifyMe();

			navigator.serviceWorker.addEventListener("message", handleSWMessage);
		}).catch(function(err) {
			console.log(err);
		});
	});
}
else {
	console.log('service worker is not supported');
}

window.addEventListener('online', function() {
	if (navigator.onLine) {
		Object.keys(localStorage).forEach(name => {
			let entry = JSON.parse(localStorage[name]);

			if (entry.action == 'add') {
				addItem(name);
			}
			else if (entry.action == 'delete') {
				deleteItem(name);
			}
			else if (entry.action == 'checked') {
				setChecked(name, entry.checked);
			}

			localStorage.removeItem(name);
		});
	}
});

function handleSWMessage(e) {
	console.log(`Navigator SW received a msg: ${e.data}`);
}

window.addEventListener('beforeinstallprompt', e => {
	e.preventDefault();
	// Stash the event so it can be triggered later.
	deferredPrompt = e;
	return false;
});

let installButton = document.getElementById("install");
	installButton.addEventListener('click', function() {
		deferredPrompt.prompt();
			deferredPrompt.userChoice.then(choice => {
				console.log(choice);
	});

	deferredPrompt = null;
});

const getNotificationPermission = async () => {
	if (!swRegistration) {
		throw new Error("ServiceWorker not registered")
	}

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
		})
	}
}

let notifyMe = async () => {
	try {
		await getNotificationPermission();
		sendNotification();
	} catch (e) {
		console.log(e);
	}
}

function sendNotification() {
	swRegistration.showNotification("Hello, World!", {
		body: "This is a dummy body",
		icon: "images/icon.png",
		actions: [
			{
				action: 'yes',
				title: 'Yes'
			}
		]
	});
}
