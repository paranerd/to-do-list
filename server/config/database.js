const mongoose = require('mongoose');

const SECONDS_BETWEEN_RETRIES = 5;
const server = process.env.DOCKER ? 'mongo' : '127.0.0.1';
const connectionString = `mongodb://${server}:27018/todo`;
const connectionParams = {
    useNewUrlParser: true,
    //useUnifiedTopology: true, --> causes timeout error, so don't use for now
    useCreateIndex: true
};

function connectWithRetry() {
    return mongoose.connect(connectionString, connectionParams, function(err) {
        if (err) {
            console.error(`Failed to connect to mongo on startup - retrying in ${SECONDS_BETWEEN_RETRIES} sec`, err);
            setTimeout(connectWithRetry, SECONDS_BETWEEN_RETRIES * 1000);
        }
    });
};

connectWithRetry();