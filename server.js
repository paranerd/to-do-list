const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/database');
const notification = require('./util/notification');
const app = express();
const port = 8088;

app.engine('.hbs', exphbs({
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    defaultLayout: 'base',
    extname: '.hbs'
}));

// Setting template Engine
app.set('view engine', '.hbs');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(require('./controllers'));

// Make sure we have VAPID keys
notification.loadVapidKeys();

// Start server
app.listen(port, () => console.log(`Listening on port ${port}`));
