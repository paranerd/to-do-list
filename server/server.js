const express = require('express');
const bodyParser = require('body-parser');
const db = require('./config/database');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 8081;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public', {index: false}));
app.use(require('./controllers'));

// Start server
app.listen(port, () => console.log(`Listening on port ${port}`));
