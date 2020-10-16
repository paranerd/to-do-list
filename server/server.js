const express = require('express');
const bodyParser = require('body-parser');
const db = require('./config/database');
const configHelper = require('./util/config-helper');

const app = express();
const config = new configHelper();

// Load environment variables
const env = config.get('env');
for (let e in env) {
    process.env[e] = env[e];
}

const port = process.env.port || 80;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public', {index: false}));
app.use(require('./controllers'));

// Start server
app.listen(port, () => console.log(`Listening on port ${port}`));
