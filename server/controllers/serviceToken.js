const express = require('express');
const auth = require('../util/auth');
const ServiceToken = require('../models/serviceToken');
const router = express.Router();

router.get('/', auth.isAuthenticated(true), async function(req, res) {
    const tokens = await ServiceToken.find({}, 'id name created');

    res.json(tokens);
});

router.post('/', auth.isAuthenticated(true), async function(req, res) {
    const { name } = req.body;

    if (!name) {
        res.status(400).json({'msg': 'No name provided'});
        return;
    }

    const token = await new ServiceToken({
        name: name,
        token: auth.generateToken({ isAdmin: false })
    });

    await token.save();

    res.json(token);
});

router.delete('/:id', auth.isAuthenticated(true), async function(req, res) {
    try {
        const token = await ServiceToken.findOne({id: req.params.id});
        await token.remove();
    
        res.json({});
    } catch (err) {
        res.status(500).json({'error': 'Error deleting service token'});
    }
});

module.exports = {
    router
};
