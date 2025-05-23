const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../../src/middlewares/authMiddleware');

const router = express.Router();

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/reset-password', authController.resetPassword);
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/verify-forgot-password-otp', authController.verifyOtp);
router.post('/logout', authMiddleware, authController.logout);

// User management routes
router.get('/users', authController.getAllUsers);
router.get('/users/:id', authMiddleware, authController.getUserById);
router.put('/users/:id', authMiddleware, authController.updateUser);
router.delete('/users/:id', authMiddleware, authController.deleteUser);

module.exports = router;
