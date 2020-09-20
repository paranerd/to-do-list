const webpush = require('web-push');
const fs = require('fs');
const path = require('path');
const configHelper = require('./config-helper');
const Subscription = require('../models/subscription');

const pathToVapid = path.join(__dirname, '../', 'config', 'vapid.json');
const config = new configHelper();

/**
 * Load VAPID credentials
 * 
 * @returns {Object}
 */
function loadVapidKeys() {
    if (fs.existsSync(pathToVapid)) {
            return fs.existsSync(pathToVapid) ? JSON.parse(fs.readFileSync(pathToVapid)) : null;
    }
    else {
		const vapidKeys = webpush.generateVAPIDKeys();
			
		fs.writeFileSync(pathToVapid, JSON.stringify(vapidKeys, null, 4));

		return vapidKeys;
	}
}

/**
 * Send push notification
 * 
 * @param {string} msg
 * @param {string} endpoint
 */
async function send(msg='', endpoint='') {
	const subscriptions = await Subscription.find({});
	const vapid = loadVapidKeys();
	const mail = config.get('mail');

	if (!vapid || !mail) {
		return;
	}

	webpush.setVapidDetails(
		'mailto:' + mail,
		vapid.publicKey,
		vapid.privateKey
	);

	for (let subscription of subscriptions) {
		// Don't send to origin
		if (subscription.endpoint != endpoint) {
			try {
				await webpush.sendNotification(subscription, msg);
			} catch (e) {
				console.log(e);
			}
			
		}
	}
}

module.exports = {
	loadVapidKeys,
	send
}
