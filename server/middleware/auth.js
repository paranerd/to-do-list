const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ServiceToken = require('../models/serviceToken');
const User = require('../models/user');
const ConfigHelper = require('../util/configHelper');

const config = new ConfigHelper();
const tokenExpiration = '24h';
const refreshTokenExpiration = '30d';
const secretLength = 16;
const jwtOptions = {
  issuer: 'task-me',
  algorithm: 'HS256',
};

/**
 * Get global secret from config.
 * Set new secret if not exists.
 *
 * @returns {string}
 */
function getSecret() {
  let secret = config.get('secret');

  if (!secret) {
    secret = crypto.randomBytes(secretLength).toString('hex');
    config.set('secret', secret);
  }

  return secret;
}

/**
 * Generate JWT from payload.
 *
 * @param {Object} payload
 * @param {Object} options
 * @returns {string}
 */
function generateToken(payload, options = {}) {
  return jwt.sign(payload, getSecret(), {
    ...jwtOptions,
    expiresIn: tokenExpiration,
    ...options,
  });
}

/**
 * Generate JWT refresh token from payload.
 *
 * @param {Object} payload
 * @param {Object} options
 * @returns {string}
 */
function generateRefreshToken(payload, options = {}) {
  return jwt.sign(payload, getSecret(), {
    ...jwtOptions,
    expiresIn: refreshTokenExpiration,
    ...options,
  });
}

/**
 * Generate JWT service token from payload.
 * Attention: This token never expires.
 *
 * @param {Object} payload
 * @param {Object} options
 * @returns {string}
 */
function generateServiceToken(payload, options = {}) {
  return jwt.sign(payload, getSecret(), {
    ...jwtOptions,
    ...options,
  });
}

/**
 * Extract token from request.
 *
 * @param {Express.Request} req
 * @returns {string}
 */
function extractToken(req) {
  let token =
    req.headers['x-access-token'] ||
    req.headers.authorization ||
    req.body.token ||
    req.query.token ||
    '';

  // Extract token from auth header
  token = token.startsWith('Bearer') ? token.split(' ')[1] : token;

  return token;
}

/**
 * Check if user is authenticated.
 * Used as Express middleware.
 *
 * @param {boolean} needsAdmin
 * @returns {function}
 */
function isAuthenticated(needsAdmin = false) {
  return async function auth(req, res, next) {
    // Get secret for signing token
    const secret = getSecret();

    // Extract token from request
    const token = extractToken(req);

    if (token) {
      try {
        // Verify token
        const decoded = jwt.verify(token, secret, jwtOptions);

        // Check permissions
        if (needsAdmin && !decoded.isAdmin) {
          res.sendStatus(403);
          return;
        }

        // Check if is a service token
        if (!decoded.username) {
          const st = await ServiceToken.find({ token });

          if (st.length === 0) {
            res.sendStatus(403);
            return;
          }
        }

        // Get user
        const user = await User.findOne({
          username: decoded.username,
        });

        // Make user available to controller
        req.user = user;

        // Make token available to controller
        req.token = token;
        req.tokenDecoded = decoded;
        next();
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          // Token expired
          res.status(401).json({ msg: 'TokenExpired' });
          return;
        }

        // Token invalid
        res.sendStatus(401);
      }
    } else {
      // No token provided
      res.sendStatus(401);
    }
  };
}

module.exports = {
  generateToken,
  generateRefreshToken,
  generateServiceToken,
  isAuthenticated,
};
