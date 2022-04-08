const mongoose = require('mongoose');

const SECONDS_BETWEEN_RETRIES = 5;
const server = process.env.DOCKER ? 'mongo' : '127.0.0.1';
const database = process.env.NODE_ENV === 'test' ? 'todo-dev' : 'todo';
const connectionString = `mongodb://${server}:27017/${database}`;
const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};

/**
 * Connect to MongoDB with retry.
 */
async function connect() {
  try {
    await mongoose.connect(connectionString, connectionParams);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(
      `Failed to connect to mongo on startup - retrying in ${SECONDS_BETWEEN_RETRIES}s`,
      err
    );
    setTimeout(connect, SECONDS_BETWEEN_RETRIES * 1000);
  }
}

module.exports = {
  connect,
};
