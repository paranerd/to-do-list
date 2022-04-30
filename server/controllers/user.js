const User = require('../models/user');

/**
 * Endpoint to create a user.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function create(req, res) {
  // Read request body
  const { username, password1, password2 } = req.body;

  if (!password1 || password1 !== password2) {
    res.status(400).json({ msg: 'Passwords do not match' });
    return;
  }

  // Fetch user from database
  let user = await User.findOne({ username });

  if (user) {
    res.status(400).json({ msg: 'User already exists' });
    return;
  }

  try {
    // Create user
    user = await new User({
      username,
      password: await User.hashPassword(password1),
    });

    // Return to client
    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
    });

    // Save user
    await user.save();
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'An error occurred' });
  }
}

/**
 * Get user settings.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function getSettings(req, res) {
  const { user } = req;

  res.json({
    tfa: user.tfa.confirmed,
  });
}

module.exports = {
  create,
  getSettings,
};
