const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/database');
const notification = require('./util/notification');
const app = express();
const port = 8088;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(require('./controllers'));

// Make sure we have VAPID keys
notification.loadVapidKeys();

// Start server
app.listen(port, () => console.log(`Listening on port ${port}`));
