// Read ENV variables
require('dotenv').config();

const app = require('./app');

// Connect to MongoDB
require('./util/database').connect();

const port = process.env.PORT || 8080;

// Start server
app.listen(port, async () => {
  console.log(`Listening at :${port}`);
});
