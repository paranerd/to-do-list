const express = require('express');
const Item = require('../models/item');
const notification = require('../util/notification');

const router = express.Router();

router.get('/', async (req, res) => {
	const items = await Item.find({});
	res.json(items);
});

router.post('/', async (req, res) => {
	const name = req.body.name || "";
	const created = req.body.created || Date.now();

	const item = new Item({
		name: name,
		created: created,
		modified: created
	});

	await item.save();

	await notification.send(item.name + " added", req.cookies.endpoint);

	res.json(item);
});

router.patch('/', async (req, res) => {
	let item = await Item.findOne({id: req.body.id});
	item.name = req.body.name;
	item.done = !!req.body.done;
	item.modified = req.body.ts || Date.now();

	await item.save();

	await notification.send(item.name + " updated", req.cookies.endpoint);

	res.json(item);
});

router.delete('/', async (req, res) => {
	const id = req.body.id;
	const timestamp = req.body.ts || Date.now();
	const item = await Item.findOne({id: id});

	if (!item) {
		res.status(404).json({});
		return;
	}

	if (item.modified > timestamp) {
		res.status(200).json({});
		return;
	}

	await item.remove();

	await notification.send(item.name + " removed", req.cookies.endpoint);

	res.json({});
});

module.exports = router;
