const express = require('express');
const { body } = require('express-validator');
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

// Rotas de autenticação
router.post('/login', loginValidation, AuthController.login);
router.post('/logout', auth, AuthController.logout);
router.get('/me', auth, AuthController.getProfile);

module.exports = router;