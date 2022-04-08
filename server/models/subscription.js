const mongoose = require('mongoose');

let Subscription;

const SubscriptionSchema = new mongoose.Schema({
  endpoint: String,
  expirationTime: String,
  keys: {
    p256dh: String,
    auth: String,
  },
});

SubscriptionSchema.statics.findOneOrCreate = async (query, data) => {
  const actualData = data || query;

  const subscription = await Subscription.findOne(query);

  return subscription || new Subscription(actualData).save();
};

// Create a model from the schema and make it publicly available
Subscription = mongoose.model('Subscription', SubscriptionSchema);
module.exports = Subscription;
