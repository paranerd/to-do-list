const { authenticator } = require('@otplib/preset-default');
const qrcode = require('qrcode');
const User = require('../models/user');
const auth = require('../middleware/auth');

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

    // Generate access token
    const token = auth.generateToken({
      username: user.username,
      isAdmin: user.isAdmin,
    });

    // Generate refresh token
    const refreshToken = auth.generateRefreshToken({
      username: user.username,
      refresh: true,
    });

    // Add refresh token to user
    user.refreshToken.push(refreshToken);

    // Save user
    await user.save();

    // Return to client
    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      token,
      refreshToken,
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
  if (!user || !(await user.validatePassword(password))) {
    res.status(401).json({ msg: 'Incorrect user or password' });
    return;
  }

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

  // Generate access token
  const token = auth.generateToken({
    username: user.username,
    isAdmin: user.isAdmin,
  });

  // Generate refresh token
  const refreshToken = auth.generateRefreshToken({
    username: user.username,
    refresh: true,
  });

  // Add refresh token to user
  user.refreshToken.push(refreshToken);

  // Save user
  await user.save();

  res.json({
    username: user.username,
    isAdmin: user.isAdmin,
    token,
    refreshToken,
  });
}

/**
 * Endpoint for logout.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function logout(req, res) {
  if (!req.tokenDecoded || !req.tokenDecoded.refresh) {
    res.status(401).json({ msg: 'Unauthorized' });
    return;
  }

  const user = await User.findOne({ refreshToken: req.token });

  if (user) {
    await user.updateOne({ $pullAll: { refreshToken: [req.token] } });
    await user.save();

    res.json({});
  } else {
    // User not found
    res.status(403).json({ msg: 'Invalid request' });
  }
}

/**
 * Endpoint to refresh auth token.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function refresh(req, res) {
  if (!req.tokenDecoded || !req.tokenDecoded.refresh) {
    res.status(401).json({ msg: 'Unauthorized' });
    return;
  }

  const user = await User.findOne({ refreshToken: req.token });

  if (user) {
    // Generate new tokens
    const token = auth.generateToken({
      username: user.username,
      isAdmin: user.isAdmin,
    });
    const refreshToken = auth.generateRefreshToken({
      username: user.username,
      refresh: true,
    });

    await user.updateOne({ $pullAll: { refreshToken: [req.token] } });
    user.refreshToken.push(refreshToken);

    await user.save();

    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      token,
      refreshToken,
    });
  } else {
    // User not found
    res.status(403).json({ msg: 'Invalid request' });
  }
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

  const service = 'Task Me';
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

module.exports = {
  setup,
  login,
  logout,
  refresh,
  enableTfa,
  confirmTfa,
  disableTfa,
};
