const express = require('express');
const fs = require('fs');
const router = express.Router();
const path = require('path');
const notification = require('../util/notification.js');

const pathToItems = path.resolve('items.json');

function loadItems() {
	return fs.existsSync(pathToItems) ? JSON.parse(fs.readFileSync(pathToItems)) : {};
}

function writeItems(items) {
	fs.writeFileSync(pathToItems, JSON.stringify(items));
}

router.get('/', (req, res) => {
	let items = loadItems();
	res.json(items);
});

router.post('/', async (req, res) => {
	let items = loadItems();
	let name = req.body.name;

	items[name] = false;
	writeItems(items);

	await notification.sendNotifications(name + " added", req.headers['x-endpoint']);

	res.json(items);
});

router.patch('/', async (req, res) => {
	let items = loadItems();
	let name = req.body.name;
	let checked = (req.body.checked === 'true');

	items[name] = checked;
	writeItems(items);

	await notification.sendNotifications(name + " updated", req.headers['x-endpoint']);

	res.json(items);
});

router.delete('/', async (req, res) => {
	let items = loadItems();
	let name = req.body.name;

	delete items[name];
	writeItems(items);

	await notification.sendNotifications(name + " removed", req.headers['x-endpoint']);

	res.json(items);
});

module.exports = router;
