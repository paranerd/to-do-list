let mongoose = require('mongoose');
mongoose.connect(`mongodb://127.0.0.1:27017/todo`, {
	useNewUrlParser: true,
	//useUnifiedTopology: true, --> causes timeout error, so don't use for now
	useCreateIndex: true
});