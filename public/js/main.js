$(document).ready(function() {
	addClickHandler();
	//loadItems();
	update();
});

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
	$.ajax({
		url: '/api/item',
		type: 'GET'
	}).done(function(items) {
		items.forEach(function(item) {
			addItem(item);
		});
	}).fail(function(xhr, status, error) {
		console.log(error);
	});
}

async function update() {
	// Start the network request as soon as possible.
	const networkPromise = fetch('/api/item');

	const cachedResponse = await caches.match('/api/item');
	if (cachedResponse) {
		console.log("cachedResponse -> check!")
		await updateItems(cachedResponse);
	}
	else {
		console.log("No cachedResponse");
	}

	try {
		const networkResponse = await networkPromise;
		const cache = await caches.open('static-cache-v1');
		cache.put('/api/item', networkResponse.clone());
		await updateItems(networkResponse);
	} catch (err) {
		console.log("error fetching network resonse");
	// Maybe report a lack of connectivity to the user.
	}

	const networkResponse = await networkPromise;
}

async function updateItems(response) {
	const items = await response.json();
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
