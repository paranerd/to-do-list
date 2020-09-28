const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const router = express.Router();

// Include cookie parser
router.use(cookieParser());
router.use(cors());

// Include all controllers
router.use('/api/item', require('./item').router);
router.use('/api/subscription', require('./subscription').router);
router.use('/api/auth', require('./auth').router);
router.use('/api/user', require('./user').router);
router.use('/api/service-token', require('./serviceToken').router);

module.exports = router;
