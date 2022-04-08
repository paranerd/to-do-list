const notification = require('../util/notification');
const Subscription = require('../models/subscription');

/**
 * Endpoint to get VAPID.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function getVapid(req, res) {
  const vapid = notification.loadVapidKeys();

  if (vapid) {
    res.json({ pubKey: vapid.publicKey });
    return;
  }

  res.status(404).json({});
}

/**
 * Endpoint to add subscription.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function subscribe(req, res) {
  await Subscription.findOneOrCreate(req.body);

  // Save endpoint to cookie for recognition
  res.cookie('endpoint', req.body.endpoint, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: 'lax',
  });

  res.json({});
}

/**
 * Endpoint to unsubscribe.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function unsubscribe(req, res) {
  await Subscription.remove(res.body);
}

module.exports = {
  getVapid,
  subscribe,
  unsubscribe,
};
