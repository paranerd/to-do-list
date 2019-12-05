const express = require('express');
const webpush = require('web-push');
const fs = require('fs');
const router = express.Router();
const path = require('path');

const pathToSubscription = path.resolve('subscription.txt');
const vapid = JSON.parse(fs.readFileSync(path.resolve('config/vapid.json')));

router.post('/save-subscription', async (req, res) => {
	await saveSubscription(req.body);
	console.log(req.body);

	res.json({
		message: 'success'
	});
});

router.get('/send-notification', async (req, res) => {
	const subscription = await getSubscription();
	console.log(subscription);
	const msg = 'Holy sh00t, that still works :-D!!!';

	sendNotification(subscription, msg);
	res.json({message: 'message sent'});
});

const saveSubscription = async subscription => {
	fs.writeFileSync(pathToSubscription, JSON.stringify(subscription));
}

const getSubscription = async () => {
	return JSON.parse(fs.readFileSync(pathToSubscription));
}

const sendNotification = (subscription, data='') => {
	webpush.sendNotification(subscription, data);
}

webpush.setVapidDetails(
	'mailto:' + vapid.mail,
	vapid.public,
	vapid.private
);

module.exports = router;
