$(document).ready(function() {
	addClickHandler();
	loadItems();
});

function showInstallButton() {
	if (!window.matchMedia('(display-mode: standalone)').matches) {
		$("#install").removeClass("hidden");
	}
}

function addClickHandler() {
	$(".items li").off('click').on('click', function() {
		$(this).find('i').toggleClass("fa-square");
		$(this).find('i').toggleClass("fa-check-square");
		$(this).toggleClass("done");
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
		console.log("Updating from network");
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
			console.log("Updating from cache");
			displayItems(items);
		}
		else {
			console.log("Network was faster")
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

	items.forEach(function(item) {
		addItem(item);
	});
}

$("#search").on('submit', function(e) {
	e.preventDefault();
	let name = capitalize($(this).find('input').val());
	console.log(name);
	this.reset();

	addItem(name);

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
});

function addItem(name) {
	let li = document.createElement('li');
	let i = document.createElement('i');
	i.className = "far fa-square"
	let span = document.createElement('span');
	span.innerText = name;

	li.appendChild(i);
	li.appendChild(span);
	$('.items').append(li);

	addClickHandler();
}

let deferredPrompt = null;
let swRegistration = null;

if ('serviceWorker' in navigator) {
	window.addEventListener('load', function() {
		navigator.serviceWorker.register('service-worker.js').then(function(registration) {
			// Registration was successful
			console.log('Registered!');
			swRegistration = registration;
			notifyMe();
		}, function(err) {
			// registration failed :(
			console.log('ServiceWorker registration failed: ', err);
		}).catch(function(err) {
			console.log(err);
		});
	});
}
else {
	console.log('service worker is not supported');
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
		console.log("granted");
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
