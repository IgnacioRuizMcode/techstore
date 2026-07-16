const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

// Registro local
router.post('/register', authController.register);

// Login local
router.post('/login', authController.login);

// Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed', session: false }), authController.googleCallback);

// Perfil
router.get('/me', authenticate, authController.getMe);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);

router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;