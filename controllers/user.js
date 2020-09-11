const express = require('express');
const notification = require('../util/notification.js');
const router = express.Router();

router.post('/save-subscription', async (req, res) => {
	await notification.addSubscription(req.body);

	res.cookie('endpoint', req.body.endpoint, {
		maxAge: 1000 * 60 * 60 * 24 * 365,
		httpOnly: true
	});

	res.json({
		message: 'success'
	});
});

router.get('/send-notification', async (req, res) => {
	try {
		await notification.sendNotifications(req.query.msg);
		res.json({message: "All sent"});
	} catch (err) {
		res.status(400).send(err.message);
	}
});

module.exports = router;
