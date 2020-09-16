const express = require('express');
const Item = require('../models/item');
const notification = require('../util/notification');
const Errors = require('../util/errors');

const router = express.Router();

/**
 * Endpoint to get all items
 */
router.get('/', async (req, res) => {
	console.log("Getting all...");
	const items = await Item.find({}).sort({pos: 1});
	res.json(items);
});

/**
 * Create item
 */
router.post('/', async (req, res) => {
	try {
		const item = await createItem(req.body);

		// Send notification
		await notification.send(item.name + " added", req.cookies.endpoint);
	
		res.json(item);
	} catch (e) {
		console.log(e);
		const status = e.status ? e.status : 500;
		res.status(status).json({'error': e.message});
	}
});

async function createItem(itemData) {
	const item = new Item(itemData);

	if (item.pos) {
		let pos = item.pos;
		const items = await Item.find({pos: {$gte: item.pos}}).sort({pos: 1});

		for (let item of items) {
			pos++;
			item.pos = pos;
			await item.save();
		}
	}
	else {
		item.pos = await Item.count();
	}

	await item.save();

	return item;
}

router.patch('/', async (req, res) => {
	try {
		const item = await updateItem(req.body);

		// Send notification
		await notification.send(item.name + " updated", req.cookies.endpoint);
	
		res.json(item);
	} catch (e) {
		console.log(e);
		const status = e.status ? e.status : 500;
		res.status(status).json({'error': e.message});
	}
});

router.delete('/', async (req, res) => {
	try {
		const item = await deleteItem(req.body);

		// Send notification
		await notification.send(item.name + " removed", req.cookies.endpoint);

		res.json(item);
	} catch (e) {
		console.log(e);
		const status = e.status ? e.status : 500;
		res.status(status).json({'error': e.message});
	}
});

async function updateItem(itemData) {
	let item = await Item.findOne({id: itemData.id});

	if (!item) {
		throw new Errors.NotFoundError();
	}

	itemData.modified = itemData.modified || Date.now();

	if (item.modified > itemData.modified) {
		return;
	}

	// Did the item move?
	if (item.pos !== itemData.pos) {
		await deleteItem(item.toObject());
		Object.assign(item, itemData);
		await createItem(item.toObject());
	}
	else {
		Object.assign(item, itemData);
		await item.save();
	}

	return item;
}

async function deleteItem(itemData) {
	const item = await Item.findOne({id: itemData.id});
	itemData.modified = itemData.modified || Date.now();

	if (!item) {
		throw new Errors.NotFoundError();
	}

	if (item.modified > itemData.modified) {
		return {};
	}

	const items = await Item.find({pos: {$gte: item.pos}}).sort({pos: 1});

	for (let item of items) {
		item.pos -= 1;
		await item.save();
	}

	await item.remove();
}

module.exports = router;
