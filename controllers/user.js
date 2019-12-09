const express = require('express');
const fs = require('fs');
const router = express.Router();
const path = require('path');
const notification = require('../util/notification.js');

router.post('/save-subscription', async (req, res) => {
	console.log("Saving subscription");
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
