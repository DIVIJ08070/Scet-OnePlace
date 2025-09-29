const express = require('express');
const router = express.Router();
const selfController = require('../controllers/self.controller');
const authenticateUser = require('../middlewares/auth.middleware');

router.get('/', authenticateUser, selfController.getUser);

module.exports = router;

