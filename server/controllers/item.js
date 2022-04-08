const Item = require('../models/item');
const notification = require('../util/notification');
const Errors = require('../util/errors');

/**
 * Create item.
 *
 * @param {Item} itemData
 * @returns {Item}
 */
async function createItem(itemData) {
  itemData.pos = itemData.pos || 0;
  const item = new Item(itemData);

  let { pos } = item;
  const items = await Item.find({ pos: { $gte: item.pos } }).sort({ pos: 1 });

  /* eslint-disable no-await-in-loop */
  items.forEach(async (i) => {
    pos += 1;
    i.pos = pos;
    await i.save();
  });

  await item.save();

  return item;
}

/**
 * Delete item
 *
 * @param {Item} itemData
 * @throws {Error}
 * @returns {boolean}
 */
async function deleteItem(itemData) {
  const item = await Item.findOne({ id: itemData.id });
  itemData.modified = itemData.modified || Date.now();

  if (!item) {
    throw new Errors.NotFoundError();
  }

  if (item.modified > itemData.modified) {
    return {};
  }

  const items = await Item.find({ pos: { $gte: item.pos } }).sort({ pos: 1 });

  /* eslint-disable no-await-in-loop */
  /* eslint-disable no-restricted-syntax */
  for (const i of items) {
    i.pos -= 1;
    await i.save();
  }

  return item.remove();
}

/**
 * Update item.
 *
 * @param {Item} itemData
 * @throws {Error}
 * @returns {Item}
 */
async function updateItem(itemData) {
  const item = await Item.findOne({ id: itemData.id });
  const itemOld = { ...item.toObject() };

  if (!item) {
    throw new Errors.NotFoundError();
  }

  itemData.modified = itemData.modified || Date.now();

  if (item.modified > itemData.modified) {
    return null;
  }

  // Did the item move?
  if (item.pos !== itemData.pos) {
    await deleteItem(item.toObject());
    Object.assign(item, itemData);
    await createItem(item.toObject());
  } else {
    Object.assign(item, itemData);
    await item.save();
  }

  return { itemOld, item };
}

/**
 * Endpoint to list all items.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function list(req, res) {
  let query = Item.find({}).sort({ pos: 1 });

  if (req.query.limit) {
    query = query.limit(parseInt(req.query.limit, 10));
  }

  const items = await query;

  res.json(items);
}

/**
 * Endpoint to create item.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function create(req, res) {
  try {
    const itemData = req.body;
    const item = await createItem(itemData);

    if (itemData.name) {
      // Send notification
      notification.send(`${itemData.name} added`, req.cookies.endpoint);
    }

    res.json(item);
  } catch (err) {
    console.error(err);
    const status = err.status ? err.status : 500;
    res.status(status).json({ error: err.message });
  }
}

/**
 * Endpoint to update item.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function update(req, res) {
  try {
    const itemData = req.body;
    const { itemOld, item } = await updateItem(itemData);

    // Send notification
    if (itemOld.name !== item.name) {
      notification.send(
        `${itemOld.name} renamed to ${item.name}`,
        req.cookies.endpoint
      );
    }

    res.json(item);
  } catch (err) {
    console.error(err);
    const status = err.status ? err.status : 500;
    res.status(status).json({ error: err.message });
  }
}

/**
 * Endpoint to delete item.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function remove(req, res) {
  try {
    const itemData = req.body;
    await deleteItem(itemData);

    // Send notification
    notification.send(`${itemData.name} removed`, req.cookies.endpoint);

    res.json({});
  } catch (err) {
    console.error(err);
    const status = err.status ? err.status : 500;
    res.status(status).json({ error: err.message });
  }
}

module.exports = {
  list,
  create,
  update,
  remove,
};
