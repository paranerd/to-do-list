const express = require('express');
const fs = require('fs');
const router = express.Router();
const path = require('path');
const cryptoRandomString = require('crypto-random-string');
const notification = require('../util/notification.js');

const pathToItems = path.resolve('items.json');
const idLength = 8;

function loadItems() {
	return fs.existsSync(pathToItems) ? JSON.parse(fs.readFileSync(pathToItems)) : {};
}

function writeItems(items) {
	fs.writeFileSync(pathToItems, JSON.stringify(items));
}

router.get('/', (req, res) => {
	const items = loadItems();
	res.json(items);
});

router.post('/', async (req, res) => {
	const items = loadItems();
	const name = req.body.name;

	const item = {
		name: req.body.name,
		created: Date.now(),
		done: false
	}

	const id = cryptoRandomString({length: idLength, type: 'url-safe'});

	items[id] = item;
	writeItems(items);

	try {
		await notification.sendNotifications(name + " added", req.cookies.endpoint);
	} catch (e) {
		console.log(e);
	}

	res.json(items);
});

router.patch('/', async (req, res) => {
	const items = loadItems();
	const id = req.body.id;
	const done = (req.body.done === 'true');

	items[id].done = done;
	writeItems(items);

	try {
		await notification.sendNotifications(name + " updated", req.cookies.endpoint);
	} catch (e) {
		console.log(e);
	}

	res.json(items);
});

router.delete('/', async (req, res) => {
	const items = loadItems();
	const id = req.body.id;

	delete items[id];
	writeItems(items);

	try {
		await notification.sendNotifications(name + " removed", req.cookies.endpoint);
	} catch (e) {
		console.log(e);
	}

	res.json(items);
});

module.exports = router;
