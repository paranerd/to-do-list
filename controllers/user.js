// To generate your key-pair, install web-push globally and run:
// web-push generate-vapid-keys

const express = require('express');
const webpush = require('web-push');
const fs = require('fs');
const router = express.Router();
const path = require('path');

const pathToSubscription = path.resolve('subscription.txt');
const pathToVapid = path.resolve('config/vapid.json');

router.post('/save-subscription', async (req, res) => {
	await saveSubscription(req.body);

	res.json({
		message: 'success'
	});
});

router.get('/send-notification', async (req, res) => {
	const subscription = await getSubscription();
	console.log(subscription);
	const msg = 'Holy sh00t, that still works :-D!!!';

	const status = await sendNotification(subscription, msg);
	res.json({message: `message ${status}`});
});

function getVapid() {
	return fs.existsSync(pathToVapid) ? JSON.parse(fs.readFileSync(pathToVapid)) : null;
}

async function saveSubscription() {
	fs.writeFileSync(pathToSubscription, JSON.stringify(subscription));
}

async function getSubscription() {
	return JSON.parse(fs.readFileSync(pathToSubscription));
}

async function sendNotification(subscription, data='') {
	try {
		let vapid = getVapid();

		webpush.setVapidDetails(
			'mailto:' + vapid.mail,
			vapid.public,
			vapid.private
		);

		await webpush.sendNotification(subscription, data);
		return "sent";
	} catch (e) {
		console.log(e);
		return "not sent";
	}
}

module.exports = router;
