const { authenticator } = require('@otplib/preset-default');
const qrcode = require('qrcode');
const auth = require('../middleware/auth');
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

  if (!user) {
    try {
      // Create user
      user = await new User({
        username,
        password: await User.hashPassword(password1),
      });

      // Save user
      await user.save();
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'An error occurred' });
      return;
    }

    // Generate an access token
    const token = auth.generateToken({
      username: user.username,
      isAdmin: user.isAdmin,
    });

    // Return to client
    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      token,
    });
  } else {
    res.status(400).json({ msg: 'User already exists' });
  }
}

/**
 * Endpoint for initial setup.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function setup(req, res) {
  // Read request body
  const { username, password1, password2 } = req.body;

  if (!password1 || password1 !== password2) {
    res.status(400).json({ msg: 'Passwords do not match' });
    return;
  }

  // Check if already set up
  const userCount = await User.countDocuments();

  if (userCount) {
    res.status(401).json({ msg: 'Already set up' });
    return;
  }

  try {
    // Create user
    const user = await new User({
      username,
      password: await User.hashPassword(password1),
      isAdmin: true,
    });

    // Save user
    await user.save();

    // Generate an access token
    const token = auth.generateToken({
      username: user.username,
      isAdmin: user.isAdmin,
    });

    // Return to client
    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'An error occurred' });
  }
}

/**
 * Endpoint for login.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function login(req, res) {
  // Read username and password from request body
  const { username, password, tfa } = req.body;

  // Find user
  const user = await User.findOne({ username });

  // Check for existance and password
  if (user && (await user.validatePassword(password))) {
    // Check for TFA
    if (user.tfa.secret && user.tfa.confirmed) {
      if (!tfa) {
        res.status(401).json({ msg: 'TFA required' });
        return;
      }
      // Validate TFA (accept token from timeslots +1 and -1)
      authenticator.options = {
        window: 1,
      };

      const tfaValid = authenticator.check(tfa, user.tfa.secret);

      if (!tfaValid) {
        res.status(401).json({ msg: 'Incorrect TFA' });
        return;
      }
    }

    // Generate an access token
    const token = auth.generateToken({
      username: user.username,
      isAdmin: user.isAdmin,
    });

    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      token,
    });
  } else {
    res.status(401).json({ msg: 'Incorrect user or password' });
  }
}

/**
 * Endpoint for logout.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function logout(req, res) {
  res.json({});
}

/**
 * Endpoint for enabling Two-Factor Authentication.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function enableTfa(req, res) {
  const { user } = req;

  if (user.tfa.confirmed) {
    res.status(400).json({ msg: 'TFA already enabled' });
    return;
  }

  const service = 'To-Do-List';
  const secret = authenticator.generateSecret(32);

  user.tfa.secret = secret;
  user.markModified('tfa');
  await user.save();

  const otpauth = authenticator.keyuri(user.username, service, secret);

  const image = await qrcode.toDataURL(otpauth);

  res.json({
    image,
    secret,
  });
}

/**
 * Endpoint for confirming Two-Factor Authentication.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function confirmTfa(req, res) {
  const { user } = req;
  const { code } = req.body;

  if (!user.tfa.secret) {
    res.status(400).json({ msg: 'TFA not enabled' });
    return;
  }

  // Validate TFA (accept token from timeslots +1 and -1)
  authenticator.options = {
    window: 1,
  };

  try {
    const tfaValid = authenticator.check(code, user.tfa.secret);

    if (!tfaValid) {
      res.status(401).json({ msg: 'Wrong TFA code' });
      return;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'An error occurred' });
    return;
  }

  user.tfa.confirmed = true;
  user.markModified('tfa');
  await user.save();

  res.json({});
}

/**
 * Disable Two-factor Authentication.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function disableTfa(req, res) {
  const { user } = req;

  user.tfa.secret = '';
  user.tfa.confirmed = false;

  user.markModified('tfa');
  await user.save();

  res.json({});
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
  setup,
  login,
  logout,
  enableTfa,
  confirmTfa,
  disableTfa,
  getSettings,
};
