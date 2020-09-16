let deferredPrompt = null;
let swRegistration = null;
let items = [];
const apiUrl = '/api/item';
const api = new Api();
const cache = new Cache();
let pasting = false;

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
				console.log("[ServiceWorker]", "Registered")
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
	document.querySelectorAll('[contenteditable]').forEach((elem) => {
		// Handle paste on item
		elem.addEventListener('paste', async (e) => {
			e.preventDefault();

			// Enter pasting state
			pasting = true;

			// Get index of current item
			let index = getChildIndex(e.target.parentNode.parentNode);

			// Get ID of current item
			const id = e.target.parentNode.parentNode.getAttribute('data-id');

			// Get current item
			const item = getItemById(id);

			// Get caret position
			const caretPos = getCaretPosition(e.target);

			// Determine name of current item
			const currentName = e.target.innerText.substring(0, caretPos);

			// Determine name of new item
			const newName = e.target.innerText.substring(caretPos);

			// Get pasted text
			const clipboardData = e.clipboardData || window.clipboardData;
			const lines = clipboardData.getData('Text').split("\n");

			for (let i = 0; i < lines.length; i++) {
				if (i == 0) {
					// Update current item
					await updateItem(id, {name: currentName + lines[i], pos: index - 1});
				}
				else if (i == lines.length - 1) {
					// Create last item
					await createItem(lines[i] + newName, index);
				}
				else {
					// Create new item
					await createItem(lines[i], index);
				}

				index++;
			}

			document.querySelector('.item:nth-child(' + (index - 1) + ') [contenteditable]').focus();

			// Leave pasting state
			pasting = false;
		});


		// Handle [Return] on item
		elem.addEventListener('keydown', async (e) => {
			if (e.which === 13) {
				e.preventDefault();

				// Get index of current item
				const index = getChildIndex(e.target.parentNode.parentNode);

				// Get ID of current item
				const id = e.target.parentNode.parentNode.getAttribute('data-id');

				// Get current item
				const item = getItemById(id);

				// Get caret position
				const caretPos = getCaretPosition(e.target);

				// Determine name of current item
				const currentName = e.target.innerText.substring(0, caretPos);

				// Determine name of new item
				const newName = e.target.innerText.substring(caretPos);

				// Update current item
				//await updateItem(id, {name: currentName, pos: index - 1});

				// Create new item
				await createItem(newName, index);

				// Focus on new item
				setTimeout(() => {
					document.querySelector('.item:nth-child(' + (index + 1) + ') [contenteditable]').focus();
				}, 10);
			}
		});

		elem.addEventListener('focusout', async (e) => {
			// Prevent falsey double update
			if (pasting) {
				return;
			}

			// Get item index
			const index = getChildIndex(e.target.parentNode.parentNode);

			// Get item ID
			const id = e.target.parentNode.parentNode.getAttribute('data-id');

			// Get item
			const item = getItemById(id);

			// Update item
			if (item && item.name !== e.target.innerText) {
				await updateItem(id, {name: e.target.innerText, pos: index - 1});
			}
		});
	});

	$(".item-status").off('click').on('click', function(e) {
		$(this).find('i').toggleClass("fa-square");
		$(this).find('i').toggleClass("fa-check-square");
		$(this).toggleClass("item-done");

		// Get item index
		const index = getChildIndex(e.target.parentNode.parentNode);

		// Get item ID
		const id = e.target.parentNode.parentNode.getAttribute('data-id');

		// Get item status
		const done = $(this).hasClass("item-done");

		updateItem(id, {done: done, pos: index - 1});
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
 * 
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Create item
 * 
 * @param {string} name
 * @param {number} pos
 */
async function createItem(name, pos) {
	let item = {name, pos};

	try {
		// Try creating on the server
		item = await api.create(item)
	} catch (e) {
		// Save creation for later instead
		item = cache.create(item);
	} finally {
		if (pos) {
			// Insert new item at index
			items.splice(pos, 0, item);
		}
		else {
			// Insert new item at the end
			items.push(item);
		}

		// Display updated items
		displayItems();
	}
}

/**
 * Update item status
 * 
 * @param {string} id
 * @param {Object} update
 */
async function updateItem(id, update) {
	let item = getItemById(id);
	Object.assign(item, update);
	item.modified = Date.now();

	try {
		// Try updating on the server
		item = await api.update(item);
	} catch (e) {
		// Save the update for later instead
		item = cache.update(item);
	} finally {
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
 * 
 * @param {string} id
 */
async function deleteItem(id) {
	let item = getItemById(id);
	item.modified = Date.now();

	try {
		// Try deleting on the server
		await api.delete(item);
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
	}).then(async function(data) {
		networkDataReceived = true;
		items = await cache.rebuild(data);
		displayItems();
	});

	// Fetch cached data
	caches.match(apiUrl).then(function(response) {
		if (!response) throw Error("No data");
		return response.json();
	}).then(async function(data) {
		// Only update if there was no network update (yet)
		if (!networkDataReceived) {
			items = await cache.rebuild(data);
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
	$("#items").empty();

	for (let item of items) {
		showItem(item);
	}

	addItemClickHandlers();
}

/**
 * Create item DOM
 * @param {Item} item
 */
function showItem(item) {
	let itemDOM = document.createElement('li');
	let statusDOM = document.createElement('i');
	statusDOM.className = "item-status";

	itemDOM.className = "item d-flex justify-content-between align-items-center";

	if (item.done) {
		itemDOM.classList.add("item-done");
		statusDOM.classList.add("far", "fa-check-square");
	}
	else {
		statusDOM.classList.add("far", "fa-square");
	}

	let nameDOM = document.createElement('span');
	nameDOM.className = "item-name flex-grow-1";
	nameDOM.innerText = item.name;
	nameDOM.contentEditable = true;

	let removeDOM = document.createElement('button');
	removeDOM.className = "item-remove btn btn-invisible"; "item-remove btn btn-outline-secondary btn-invisible";
	removeDOM.innerHTML = "&times;";

	let leftDOM = document.createElement('div');
	leftDOM.className = "d-flex align-items-center flex-grow-1";

	leftDOM.appendChild(statusDOM);
	leftDOM.appendChild(nameDOM);

	itemDOM.appendChild(leftDOM);
	itemDOM.appendChild(removeDOM);
	itemDOM.setAttribute('data-id', item.id);
	$('#items').append(itemDOM);
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

/**
 * Get 1-based index of element in parent
 * 
 * @param {HTMLElement} elem
 * @returns {number}
 */
function getChildIndex(elem) {
	let i = 1;
	while ((elem = elem.previousSibling) != null) ++i;

	return i;
}

function getCaretPosition(elem) {
	if (window.getSelection) {
		const sel = window.getSelection();

		if (sel.rangeCount) {
			range = sel.getRangeAt(0);
			if (range.commonAncestorContainer.parentNode == elem) {
				return range.endOffset;
			}
		}
	}
	else if (document.selection && document.selection.createRange) {
		const range = document.selection.createRange();

		if (range.parentElement() == elem) {
			const tempEl = document.createElement("span");
			elem.insertBefore(tempEl, elem.firstChild);
		
			const tempRange = range.duplicate();
			tempRange.moveToElementText(tempEl);
			tempRange.setEndPoint("EndToEnd", range);
			
			return tempRange.text.length;
		}
	}

	return 0;
}

/*
line1
line2
line3
*/