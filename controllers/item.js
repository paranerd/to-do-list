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
	const item = await createItem(req.body);

	res.json(item);

	/*const name = req.body.name || "";
	const created = req.body.created || Date.now();

	const item = new Item({
		name: name,
		created: created,
		modified: created
	});

	await item.save();

	await notification.send(item.name + " added", req.cookies.endpoint);

	res.json(item);*/
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

	// await notification.send(item.name + " added", req.cookies.endpoint);

	return item;
}

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
	console.log(itemData);
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

router.patch('/', async (req, res) => {
	try {
		const item = await updateItem(req.body);

		// await notification.send(item.name + " updated", req.cookies.endpoint);
	
		res.json(item);
	} catch (e) {
		console.log(e);
		const status = e.status ? e.status : 500;
		res.status(status).json({'error': e.message});
	}

	/*let item = await Item.findOne({id: req.body.id});
	item.name = req.body.name;
	item.done = !!req.body.done;
	item.modified = req.body.ts || Date.now();

	await item.save();

	await notification.send(item.name + " updated", req.cookies.endpoint);

	res.json(item);*/
});

router.delete('/', async (req, res) => {
	try {
		console.log("delete", req.body);
		const item = await deleteItem(req.body);

		//await notification.send(item.name + " removed", req.cookies.endpoint);

		res.json(item);
	} catch (e) {
		console.log(e);
		const status = e.status ? e.status : 500;
		res.status(status).json({'error': e.message});
	}

	/*const id = req.body.id;
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

	//await notification.send(item.name + " removed", req.cookies.endpoint);

	res.json({});*/
});

module.exports = router;
