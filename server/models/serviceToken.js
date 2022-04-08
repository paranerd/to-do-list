const mongoose = require('mongoose');
const uuid = require('uuid');

const ServiceTokenSchema = new mongoose.Schema({
  id: String,
  name: { type: String, required: true },
  token: { type: String, required: true },
  created: { type: Number, default: Date.now() },
});

ServiceTokenSchema.pre('save', function preSave() {
  this.id = this.id || uuid.v4();
  this.created = this.created || Date.now();
});

// Create a model from the schema and make it publicly available
const ServiceToken = mongoose.model('ServiceToken', ServiceTokenSchema);
module.exports = ServiceToken;
