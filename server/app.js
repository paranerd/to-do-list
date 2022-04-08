const express = require('express');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public', { index: false }));

// Routes
app.use(routes);

module.exports = app;
