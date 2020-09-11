const mongoose = require('mongoose');

// Determine environment
const server = process.env.DOCKER ? 'mongo' : '127.0.0.1';

mongoose.connect(`mongodb://${server}:27017/todo`, {
	useNewUrlParser: true,
	//useUnifiedTopology: true, --> causes timeout error, so don't use for now
	useCreateIndex: true
});
