const express = require('express');
const auth = require('../util/auth');
const User = require('../models/user');
const router = express.Router();

router.post('/login', async function(req, res) {
    // Read username and password from request body
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({username});

    // Check for existance and password
    if (user && await user.validatePassword(password)) {
        // Generate an access token
        const token = auth.generateToken({ username: user.username, isAdmin: user.isAdmin});

        res.json({
            username: username,
            isAdmin: user.isAdmin,
            token: token,
        });
    }
    else {
        res.status(403).json({'msg': 'Username or password incorrect'});
    }
});

router.get('/logout', function(req, res) {
    res.json({});
});

module.exports = {
    router
};
