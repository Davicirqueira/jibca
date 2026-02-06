const express = require('express');
const { body, param } = require('express-validator');
const AuthController = require('../controllers/AuthController');
const { auth } = require('../middleware/auth');
const { authLimiter, resetPasswordLimiter } = require('../middleware/rateLimiter');
const { basicSanitization, passwordSanitization } = require('../middleware/sanitizer');

const router = express.Router();

// Validações para login
const loginValidation = [
  ...basicSanitization,
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ser válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
];

// Validações para forgot password
const forgotPasswordValidation = [
  ...basicSanitization,
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ser válido')
];

// Validações para reset password
const resetPasswordValidation = [
  ...basicSanitization,
  ...passwordSanitization,
  body('token')
    .notEmpty()
    .withMessage('Token é obrigatório')
    .isLength({ min: 32, max: 255 })
    .withMessage('Token inválido'),
  body('newPassword')
    .isLength({ min: 6, max: 50 })
    .withMessage('Senha deve ter entre 6 e 50 caracteres'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirmação de senha é obrigatória')
];

// Rotas de autenticação
router.post('/login', authLimiter, loginValidation, AuthController.login);
router.post('/logout', auth, AuthController.logout);
router.get('/me', auth, AuthController.getProfile);

// Rotas de recuperação de senha
router.post('/forgot-password', resetPasswordLimiter, forgotPasswordValidation, AuthController.forgotPassword);
router.get('/validate-reset-token/:token', AuthController.validateResetToken);
router.post('/reset-password', resetPasswordLimiter, resetPasswordValidation, AuthController.resetPassword);

module.exports = router;