const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const pathToSubscriptions = path.resolve('config/subscriptions.json');
const pathToVapid = path.resolve('config/vapid.json');

async function sendNotifications(msg='', endpoint='') {
	const subscriptions = await getSubscriptions();
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

function getVapid() {
	return fs.existsSync(pathToVapid) ? JSON.parse(fs.readFileSync(pathToVapid)) : null;
}

function addSubscription(subscription) {
	let subscriptions = getSubscriptions();

	if (subscriptions) {
		subscriptions[subscription.endpoint] = subscription;

		fs.writeFileSync(pathToSubscriptions, JSON.stringify(subscriptions, null, 4));
	}
}

function getSubscriptions() {
	return fs.existsSync(pathToSubscriptions) ? JSON.parse(fs.readFileSync(pathToSubscriptions)) : {};
}

module.exports = {
	addSubscription: addSubscription,
	sendNotifications: sendNotifications
}
