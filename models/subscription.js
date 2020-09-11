const mongoose = require('mongoose');

let SubscriptionSchema = new mongoose.Schema({
    endpoint: String,
    expirationTime: String,
    keys: {
        p256dh: String,
        auth: String
    }
});

SubscriptionSchema.statics.findOneOrCreate = async (query, data) => {
    data = (data) ? data : query;

	const subscription = await Subscription.findOne(query);

	return subscription || await new Subscription(data).save();
}

// Create a model from the schema and make it publicly available
const Subscription = mongoose.model('Subscription', SubscriptionSchema);
module.exports = Subscription;