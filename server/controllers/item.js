const express = require('express');
const Item = require('../models/item');
const notification = require('../util/notification');
const auth = require('../util/auth');
const Errors = require('../util/errors');

const router = express.Router();

/**
 * Endpoint to get all items
 */
router.get('/', auth.isAuthenticated(), async (req, res) => {
    let query = Item.find({}).sort({pos: 1});

    if (req.query.limit) {
        query = query.limit(parseInt(req.query.limit));
    }

    const items = await query;
    res.json(items);
});

/**
 * Create item
 */
router.post('/', auth.isAuthenticated(), async (req, res) => {
    try {
        const itemData = req.body;
        const item = await createItem(itemData);

        if (itemData.name) {
            // Send notification
            notification.send(itemData.name + " added", req.cookies.endpoint);
        }

        res.json(item);
    } catch (err) {
        console.error(err);
        const status = err.status ? err.status : 500;
        res.status(status).json({'error': err.message});
    }
});

router.patch('/', auth.isAuthenticated(), async (req, res) => {
    try {
        const itemData = req.body;
        const { itemOld, item } = await updateItem(itemData);

        // Send notification
        if (itemOld.name !== item.name) {
            notification.send(itemOld.name + " renamed to " + item.name, req.cookies.endpoint);
        }

        res.json(item);
    } catch (err) {
        console.error(err);
        const status = err.status ? err.status : 500;
        res.status(status).json({'error': err.message});
    }
});

router.delete('/', auth.isAuthenticated(), async (req, res) => {
    try {
        const itemData = req.body;
        await deleteItem(itemData);

        // Send notification
        notification.send(itemData.name + " removed", req.cookies.endpoint);

        res.json({});
    } catch (err) {
        console.error(err);
        const status = err.status ? err.status : 500;
        res.status(status).json({'error': err.message});
	}
});

/**
 * Create item
 * 
 * @param {Item} itemData
 * @returns {Item}
 */
async function createItem(itemData) {
    itemData.pos = itemData.pos || 0;
    const item = new Item(itemData);

    let pos = item.pos;
    const items = await Item.find({pos: {$gte: item.pos}}).sort({pos: 1});

    for (let item of items) {
        pos++;
        item.pos = pos;
        await item.save();
    }

    await item.save();

    return item;
}

/**
 * Update item
 * 
 * @param {Item} itemData
 * @throws {Error}
 * @returns {Item}
 */
async function updateItem(itemData) {
    let item = await Item.findOne({id: itemData.id});
    const itemOld = Object.assign({}, item.toObject());

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

    return { itemOld, item };
}

/**
 * Delete item
 * 
 * @param {Item} itemData
 * @throws {Error}
 * @returns {boolean}
 */
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

    return await item.remove();
}

module.exports = {
    router
};
