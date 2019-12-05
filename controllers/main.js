const express = require('express');
const router = express.Router();
const path = require('path');

router.get(['/', '/index.html'], (req, res) => {
	res.sendFile(path.resolve('views/index.html'));
});

module.exports = router;
