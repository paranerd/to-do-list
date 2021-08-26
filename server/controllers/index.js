const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const router = express.Router();

// Include cookie parser
router.use(cookieParser());

if (!!process.env.PRODUCTION) {
    router.use(cors());
}

// Include all controllers
router.use('/api/item', require('./item').router);
router.use('/api/subscription', require('./subscription').router);
router.use('/api/user', require('./user').router);
router.use('/api/service-token', require('./serviceToken').router);

// Serve static angular build
router.use('/', express.static('./dist'));

router.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'dist', 'index.html'));
});

module.exports = router;
