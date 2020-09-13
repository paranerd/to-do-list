const express = require('express');
const path = require('path');
const notification = require('../util/notification');
const router = express.Router();

router.get(['/', '/index.html'], (req, res) => {
	res.sendFile(path.resolve('views/index.html'));
});

router.get(['/api/vapid'], (req, res) => {
	const vapid = notification.loadVapidKeys();

	if (vapid) {
		res.json({pubKey: vapid.publicKey});
		return;
	}

	res.status(404).json({});
});

module.exports = router;
