const express = require('express');
const notification = require('../util/notification.js');
const router = express.Router();

router.get(['/vapid'], (req, res) => {
	const vapid = notification.loadVapidKeys();

	if (vapid) {
		res.json({pubKey: vapid.publicKey});
		return;
	}

	res.status(404).json({});
});

router.post('/', async (req, res) => {
    await Subscription.findOneOrCreate(req.body);

	// Save endpoint to cookie for recognition
	res.cookie('endpoint', req.body.endpoint, {
		maxAge: 1000 * 60 * 60 * 24 * 365,
		httpOnly: true,
		sameSite: "lax"
	});

	res.json({});
});

router.delete('/', async (req, res) => {
    await Subscription.remove(res.body);
});

module.exports = router;
