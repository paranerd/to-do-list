const express = require('express');
const User = require('../models/user');
const auth = require('../util/auth');
const router = express.Router();

router.post('/', auth.isAuthenticated(true), async function(req, res) {
	// Read request body
    const { username, password1, password2 } = req.body;

	if (!password1 || password1 != password2) {
        res.status(400).json({'msg': 'Passwords do not match'});
        return;
    }

    // Fetch user from database
    let user = await User.findOne({username});

    if (!user) {
        try {
            // Create user
            user = await new User({
                username: username,
                password: await User.hashPassword(password1)
            });
            
            // Save user
            await user.save();
        } catch (err) {
            console.log(err);
            res.status(500).json({'msg': 'An error occurred'});
            return;
        }

        // Generate an access token
        const token = auth.generateToken({ username: user.username, isAdmin: user.isAdmin});

        // Return to client
        res.json({
            username: user.username,
            isAdmin: user.isAdmin,
            token: token,
        });
    } else {
        res.status(400).json({'msg': 'User already exists'});
    }
});

router.post('/setup', async function(req, res) {
	// Read request body
    const { username, password1, password2 } = req.body;

	if (!password1 || password1 != password2) {
        res.status(400).json({'msg': 'Passwords do not match'});
        return;
    }

    // Check if already set up
    const userCount = await User.countDocuments();

    if (userCount) {
        res.status(401).json({'msg': 'Already set up'});
    }

    try {
        // Create user
        const user = await new User({
            username: username,
            password: await User.hashPassword(password1),
            isAdmin: true
        });
        
        // Save user
        await user.save();

        // Generate an access token
        const token = auth.generateToken({ username: user.username, isAdmin: user.isAdmin });

        // Return to client
        res.json({
            username: user.username,
            isAdmin: user.isAdmin,
            token: token,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({'msg': 'An error occurred'});
        return;
    }
});

router.post('/login', async function(req, res) {
    // Read username and password from request body
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({username});

    // Check for existance and password
    if (user && await user.validatePassword(password)) {
        // Generate an access token
        const token = auth.generateToken({ username: user.username, isAdmin: user.isAdmin });

        res.json({
            username: user.username,
            isAdmin: user.isAdmin,
            token: token,
        });
    } else {
        res.status(403).json({'msg': 'Incorrect user or password'});
    }
});

router.get('/logout', function(req, res) {
    res.json({});
});

module.exports = {
    router
};
