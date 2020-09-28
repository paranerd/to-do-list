const jwt = require('jsonwebtoken');
const cryptoRandomString = require('crypto-random-string');
const ServiceToken = require('../models/serviceToken');
const configHelper = require('./config-helper');
const config = new configHelper();

/**
 * Get global secret from config
 * 
 * @returns {string}
 */
function getSecret() {
    let secret = config.get('secret');

    if (!secret) {
        secret = cryptoRandomString({length: 32, type: 'url-safe'});
        config.set('secret', secret);
    }

    return secret;
}

/**
 * Generate JWT from payload
 * 
 * @param {Object} payload
 * @returns {string}
 */
function generateToken(payload) {
    return jwt.sign(payload, getSecret(), { algorithm: 'HS256'});
}

/**
 * Check if user is authenticated
 * 
 * @param {boolean} needsAdmin
 */
function isAuthenticated(needsAdmin = false) {
    return async function (req, res, next) {
        const secret = getSecret();
        const authHeader = req.headers.authorization;
    
        if (authHeader) {
            const token = authHeader.split(' ')[1];
    
            jwt.verify(token, secret, async (err, data) => {
                if (err || (needsAdmin && !data.isAdmin)) {
                    res.sendStatus(403);
                    return;
                }

                if (!data.username) {
                    const s = await ServiceToken.find({token: token});

                    if (!s) {
                        res.sendStatus(403);
                        return;
                    }
                }
    
                req.user = data;
                next();
            });
        }
        else {
            res.sendStatus(401);
        }
    }
}

module.exports = {
    generateToken,
    isAuthenticated
}
