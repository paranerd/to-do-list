const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const router = express.Router();

// Middleware
const auth = require('../middleware/auth');

// Controllers
const authController = require('../controllers/auth');
const itemController = require('../controllers/item');
const serviceTokenController = require('../controllers/serviceToken');
const subscriptionController = require('../controllers/subscription');
const userController = require('../controllers/user');

// Include cookie parser
router.use(cookieParser());

if (process.env.PRODUCTION) {
  router.use(cors());
}

// Auth routes
router.post('/api/auth/setup', authController.setup);
router.post('/api/auth/login', authController.login);
router.post('/api/auth/logout', auth.isAuthenticated(), authController.logout);
router.post(
  '/api/auth/refresh',
  auth.isAuthenticated(),
  authController.refresh
);
router.post(
  '/api/auth/enable-tfa',
  auth.isAuthenticated(),
  authController.enableTfa
);
router.post(
  '/api/auth/disable-tfa',
  auth.isAuthenticated(),
  authController.disableTfa
);
router.post(
  '/api/auth/confirm-tfa',
  auth.isAuthenticated(),
  authController.confirmTfa
);

// Item routes
router.get('/api/item', auth.isAuthenticated(), itemController.list);
router.post('/api/item', auth.isAuthenticated(), itemController.create);
router.patch('/api/item', auth.isAuthenticated(), itemController.update);
router.delete('/api/item', auth.isAuthenticated(), itemController.remove);
router.post(
  '/api/item/clearDone',
  auth.isAuthenticated(),
  itemController.clearDone
);

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
router.get(
  '/api/user/settings',
  auth.isAuthenticated(),
  userController.getSettings
);

// Serve static angular build
router.use('/', express.static('./dist'));

router.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'dist', 'index.html'));
});

module.exports = router;
