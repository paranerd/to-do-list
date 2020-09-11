const express = require('express');
const fs = require('fs');
const router = express.Router();
const path = require('path');
const uuid = require('uuid');
const notification = require('../util/notification.js');

const pathToItems = path.join(__dirname, '../', 'config', 'items.json');
const idLength = 8;
const items = loadItems();

function loadItems() {
	return fs.existsSync(pathToItems) ? JSON.parse(fs.readFileSync(pathToItems)) : [];
}

function writeItems(items) {
	fs.writeFileSync(pathToItems, JSON.stringify(items, null, 4));
}

router.get('/', (req, res) => {
	res.json(items);
});

router.post('/', async (req, res) => {
	const name = req.body.name;
	const created = req.body.created || Date.now();

	if (!name) {
		res.status(400).json({});
		return;
	}

	const item = {
		id: uuid.v4(),
		name: req.body.name,
		created: created,
		modified: created,
		done: false
	}

	addItem(item);

	await notification.sendNotifications(name + " added", req.cookies.endpoint);

	res.json(item);
});

router.patch('/', async (req, res) => {
	const id = req.body.id;
	const timestamp = req.body.ts || Date.now();
	const done = !!req.body.done;
	
	let item = getItemById(id);
	item.done = done;
	item.modified = Date.now();

	updateItem(item);

	await notification.sendNotifications(item.name + " updated", req.cookies.endpoint);

	res.json(item);
});

router.delete('/', async (req, res) => {
	const id = req.body.id;
	const timestamp = req.body.ts || Date.now();
	const item = getItemById(id);

	if (!item) {
		res.status(404).json({});
		return;
	}

	if (item.modified > timestamp) {
		res.status(200).json({});
		return;
	}

	deleteItem(id);

	await notification.sendNotifications(name + " removed", req.cookies.endpoint);

	res.json({});
});

function getItemById(id) {
	for (let item of items) {
		if (item.id === id) {
			return item;
		}
	}
}

function addItem(item) {
	items.push(item);
	writeItems(items);
}

function updateItem(item) {
	for (let i = 0; i < items.length; i++) {
		if (items[i].id === item.id) {
			items[i] = item;
			break;
		}
	}

	writeItems(items);
}

function deleteItem(id) {
	for (let i = items.length -1; i >= 0 ; i--) {
		if (items[i].id === id) {
			items.splice(i, 1);
			break;
		}
	}

	writeItems(items);
}

module.exports = router;
