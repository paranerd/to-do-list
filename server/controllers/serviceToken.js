const auth = require('../middleware/auth');
const ServiceToken = require('../models/serviceToken');

/**
 * Endpoint to list all service tokens.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function list(req, res) {
  const tokens = await ServiceToken.find({}, 'id name created');

  res.json(tokens);
}

/**
 * Endpoint to create service token.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function create(req, res) {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ msg: 'No name provided' });
    return;
  }

  const token = await new ServiceToken({
    name,
    token: auth.generateServiceToken({ isAdmin: false }),
  });

  await token.save();

  res.json({
    id: token.id,
    name: token.name,
    token: token.token,
  });
}

/**
 * Endpoint to remove a service token.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function remove(req, res) {
  try {
    const token = await ServiceToken.findOne({ id: req.params.id });
    await token.remove();

    res.json({});
  } catch (err) {
    res.status(500).json({ error: 'Error deleting service token' });
  }
}

module.exports = {
  list,
  create,
  remove,
};
