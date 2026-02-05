const express = require('express');
const { body, param } = require('express-validator');
const AuthController = require('../controllers/AuthController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validações para login
const loginValidation = [
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
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ser válido')
];

// Validações para reset password
const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token é obrigatório')
    .isLength({ min: 32, max: 255 })
    .withMessage('Token inválido'),
  body('newPassword')
    .isLength({ min: 6, max: 50 })
    .withMessage('Senha deve ter entre 6 e 50 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter letras maiúsculas, minúsculas e números'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirmação de senha é obrigatória')
];

// Rotas de autenticação
router.post('/login', loginValidation, AuthController.login);
router.post('/logout', auth, AuthController.logout);
router.get('/me', auth, AuthController.getProfile);

// Rotas de recuperação de senha
router.post('/forgot-password', forgotPasswordValidation, AuthController.forgotPassword);
router.get('/validate-reset-token/:token', AuthController.validateResetToken);
router.post('/reset-password', resetPasswordValidation, AuthController.resetPassword);

module.exports = router;