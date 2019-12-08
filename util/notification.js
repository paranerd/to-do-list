/*
To generate your key-pair, install web-push globally and run:
web-push generate-vapid-keys
Then add config/vapid.json with the following structure:

{
  "mail": "",
  "public": "",
  "private": ""
}
*/

const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const pathToSubscriptions = path.resolve('config/subscriptions.json');
const pathToVapid = path.resolve('config/vapid.json');

async function sendNotifications(msg='', endpoint='') {
	const subscriptions = await getSubscriptions();
	const vapid = getVapid();

	webpush.setVapidDetails(
		'mailto:' + vapid.mail,
		vapid.public,
		vapid.private
	);

	try {
		for (let s in subscriptions) {
			if (subscriptions[s].endpoint != endpoint) {
				await webpush.sendNotification(subscriptions[s], msg);
			}
		}
	} catch (err) {
		throw new Error(err);
	}
}

function getVapid() {
	return fs.existsSync(pathToVapid) ? JSON.parse(fs.readFileSync(pathToVapid)) : null;
}

async function addSubscription(subscription) {
	let subscriptions = getSubscriptions();

	subscriptions[subscription.endpoint] = subscription;

	fs.writeFileSync(pathToSubscriptions, JSON.stringify(subscriptions, null, 4));
}

function getSubscriptions() {
	return fs.existsSync(pathToSubscriptions) ? JSON.parse(fs.readFileSync(pathToSubscriptions)) : {};
}

module.exports = {
	addSubscription: addSubscription,
	sendNotifications: sendNotifications
}
