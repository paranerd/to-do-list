const webpush = require('web-push');
const fs = require('fs');
const path = require('path');
const Subscription = require('../models/subscription');

const pathToVapid = path.join(__dirname, '../', 'config', 'vapid.json');

function getVapid() {
	return fs.existsSync(pathToVapid) ? JSON.parse(fs.readFileSync(pathToVapid)) : null;
}

async function sendNotifications(msg='', endpoint='') {
	const subscriptions = await Subscription.find({});
	const vapid = getVapid();

	if (!vapid) {
		return;
	}

	webpush.setVapidDetails(
		'mailto:' + vapid.mail,
		vapid.public,
		vapid.private
	);

	for (let s in subscriptions) {
		if (subscriptions[s].endpoint != endpoint) {
			try {
				await webpush.sendNotification(subscriptions[s], msg);
			} catch (e) {
				console.log(e);
			}
			
		}
	}
}

async function addSubscription(subscription) {
	await Subscription.findOneOrCreate(subscription);
}

module.exports = {
	addSubscription: addSubscription,
	sendNotifications: sendNotifications
}
