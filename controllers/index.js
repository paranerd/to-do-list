const express = require('express');
const router = express.Router();

// Include all controllers
router.use('/', require('./main'));
router.use('/api/item', require('./item'));
router.use('/api/user', require('./user'));

module.exports = router;
