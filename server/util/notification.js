const webpush = require('web-push');
const configHelper = require('./config-helper');
const Subscription = require('../models/subscription');

const config = new configHelper();

/**
 * Load VAPID credentials
 * 
 * @returns {Object}
 */
function loadVapidKeys() {
    let vapidKeys = config.get('vapid');

    if (!vapidKeys) {
        vapidKeys = webpush.generateVAPIDKeys();
        config.set('vapid', vapidKeys);
    }

    return vapidKeys;
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

    const notificationPayload = {
        "notification": {
            "title": "To-Do List",
            "body": msg,
            "icon": "assets/icons/icon-192x192.png",
            "data": {
                "dateOfArrival": Date.now(),
                "primaryKey": 1
            },
            "actions": [{
                "action": "items",
                "title": "Open List"
            }]
        }
    }

    Promise.all(subscriptions.map(async subscription => {
        if (subscription.endpoint != endpoint) {
            await webpush.sendNotification(subscription, JSON.stringify(notificationPayload) )
        }
    }))
    .catch(err => {
        console.error("Error sending notification", err);
    });
    }

module.exports = {
    loadVapidKeys,
    send
}
