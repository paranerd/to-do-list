const express = require('express');
const fs = require('fs');
const router = express.Router();
const path = require('path');

const pathToItems = path.resolve('items.txt');

function loadItems() {
	return fs.existsSync(pathToItems) ? JSON.parse(fs.readFileSync(pathToItems)) : [];
}

function writeItems(items) {
	fs.writeFileSync(pathToItems, JSON.stringify(items));
}

router.get('/', (req, res) => {
	let items = loadItems();
	res.json(items);
});

router.post('/', (req, res) => {
	let items = loadItems();
	console.log(items);
	items.push(req.body.name);
	writeItems(items);

	res.json(items);
});

module.exports = router;
