const express = require('express');
const notification = require('../util/notification.js');
const router = express.Router();

router.post('/subscribe', async (req, res) => {
	await notification.subscribe(req.body);

	// Save endpoint to cookie for recognition
	res.cookie('endpoint', req.body.endpoint, {
		maxAge: 1000 * 60 * 60 * 24 * 365,
		httpOnly: true,
		sameSite: "lax"
	});

	res.json({});
});

router.post('/unsubscribe', async (req, res) => {
	await notification.unsubscribe(res.body);
});

module.exports = router;
