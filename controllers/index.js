const express = require('express');
const cookieParser = require('cookie-parser');
const router = express.Router();

// Include cookie parser
router.use(cookieParser());

// Include all controllers
router.use('/', require('./main'));
router.use('/api/item', require('./item'));
router.use('/api/user', require('./user'));

module.exports = router;
