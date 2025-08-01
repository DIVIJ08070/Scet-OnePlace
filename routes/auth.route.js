const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const velidaterefreshToken = require('../middlewares/validateRefreshToken.middleware');

router.post('/login',authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.post('/refresh', velidaterefreshToken, authController.refreshTokens);

module.exports = router;