const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const router = express.Router();

// Middleware
const auth = require('../middleware/auth');

// Controllers
const itemController = require('../controllers/item');
const serviceTokenController = require('../controllers/serviceToken');
const subscriptionController = require('../controllers/subscription');
const userController = require('../controllers/user');

// Include cookie parser
router.use(cookieParser());

if (process.env.PRODUCTION) {
  router.use(cors());
}

// Item routes
router.get('/api/item', auth.isAuthenticated(), itemController.list);
router.post('/api/item', auth.isAuthenticated(), itemController.create);
router.patch('/api/item', auth.isAuthenticated(), itemController.update);
router.delete('/api/item', auth.isAuthenticated(), itemController.remove);

// Subscription routes
router.get(
  '/api/subscription/vapid',
  auth.isAuthenticated(),
  subscriptionController.getVapid
);
router.post(
  '/api/subscription',
  auth.isAuthenticated(),
  subscriptionController.subscribe
);
router.delete(
  '/api/subscription',
  auth.isAuthenticated(),
  subscriptionController.unsubscribe
);

// Service Token routes
router.get(
  '/api/service-token',
  auth.isAuthenticated(true),
  serviceTokenController.list
);
router.post(
  '/api/service-token',
  auth.isAuthenticated(true),
  serviceTokenController.create
);
router.delete(
  '/api/service-token/:id',
  auth.isAuthenticated(true),
  serviceTokenController.remove
);

// User routes
router.post('/api/user', auth.isAuthenticated(true), userController.create);
router.post('/api/user/setup', userController.setup);
router.get(
  '/api/user/settings',
  auth.isAuthenticated(),
  userController.getSettings
);
router.post('/api/user/login', userController.login);
router.post('/api/user/logout', auth.isAuthenticated(), userController.logout);
router.post(
  '/api/user/enable-tfa',
  auth.isAuthenticated(),
  userController.enableTfa
);
router.post(
  '/api/user/disable-tfa',
  auth.isAuthenticated(),
  userController.disableTfa
);
router.post(
  '/api/user/confirm-tfa',
  auth.isAuthenticated(),
  userController.confirmTfa
);

// Serve static angular build
router.use('/', express.static('./dist'));

router.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'dist', 'index.html'));
});

module.exports = router;
