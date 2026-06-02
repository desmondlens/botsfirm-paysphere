/**
 * Botsfirm PaySphere — Auth Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);
router.post('/trial-signup', authController.trialSignup);
router.post('/redeem-invite', authController.redeemInvite);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', verifyToken, authController.changePassword);
router.post('/employee-first-login', verifyToken, authController.employeeFirstLogin);
router.get('/me', verifyToken, authController.me);

module.exports = router;