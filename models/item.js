const mongoose = require('mongoose');
const uuid = require('uuid');

let ItemSchema = new mongoose.Schema({
    id: String,
    name: String,
    created: {type: Number, default: Date.now()},
    modified: {type: Number, default: Date.now()},
    done: {type: Boolean, default: false}
});

ItemSchema.pre('save', function() {
    this.id = this.id || uuid.v4();
});

// Create a model from the schema and make it publicly available
const Item = mongoose.model('Item', ItemSchema);
module.exports = Item;