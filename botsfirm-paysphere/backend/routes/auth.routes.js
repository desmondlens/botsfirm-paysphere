// auth.routes.js
// Mounts authentication endpoints under /api/auth.

const express = require('express');
const rateLimit = require('express-rate-limit');

const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Brute-force protection on the login endpoint: 5 attempts per 15 minutes per
// IP. Tunable via env if needed.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.LOGIN_RATE_LIMIT || '5', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many password reset requests. Try again later.' },
});

router.post('/login', loginLimiter, authController.login);
router.post('/logout', verifyToken, authController.logout);

router.post('/trial-signup', authController.trialSignup);
router.post('/redeem-invite', authController.redeemInvite);

router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.post('/change-password', verifyToken, authController.changePassword);
router.post('/employee-first-login', verifyToken, authController.employeeFirstLogin);

router.get('/me', verifyToken, authController.me);

module.exports = router;
