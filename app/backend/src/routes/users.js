const express = require('express');
const { body, query } = require('express-validator');
const UserController = require('../controllers/UserController');
const { auth, requireRole, requireLeaderForDeactivation } = require('../middleware/auth');
const { createResourceLimiter, sensitiveLimiter } = require('../middleware/rateLimiter');
const { userFormSanitization, queryParamsSanitization, passwordSanitization } = require('../middleware/sanitizer');

const router = express.Router();

// Validações para criação de usuário
const createUserValidation = [
  ...userFormSanitization,
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ser válido'),
  body('phone')
    .optional()
    .trim()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) return true; // Permitir limpar telefone
      
      // Remover todos os caracteres não numéricos para validação
      const numbersOnly = value.replace(/\D/g, '');
      
      // Aceitar telefones com 10 ou 11 dígitos (com ou sem DDD)
      if (numbersOnly.length < 10 || numbersOnly.length > 11) {
        throw new Error('Telefone deve ter 10 ou 11 dígitos');
      }
      
      return true;
    }),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
];

// Validações para atualização de usuário
const updateUserValidation = [
  ...userFormSanitization,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ser válido'),
  body('phone')
    .optional()
    .trim()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) return true; // Permitir limpar telefone
      
      // Remover todos os caracteres não numéricos para validação
      const numbersOnly = value.replace(/\D/g, '');
      
      // Aceitar telefones com 10 ou 11 dígitos (com ou sem DDD)
      if (numbersOnly.length < 10 || numbersOnly.length > 11) {
        throw new Error('Telefone deve ter 10 ou 11 dígitos');
      }
      
      return true;
    })
];

// Validações para alteração de senha
const changePasswordValidation = [
  ...passwordSanitization,
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres'),
  body('confirmPassword')
    .isLength({ min: 6 })
    .withMessage('Confirmação de senha deve ter pelo menos 6 caracteres')
];

// Validações para listagem
const listValidation = [
  ...queryParamsSanitization,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser entre 1 e 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Busca deve ter no máximo 100 caracteres')
];

// Rotas de usuários (apenas para líderes)
router.get('/stats', auth, requireRole('leader'), UserController.getStats);
router.post('/', auth, requireRole('leader'), createResourceLimiter, createUserValidation, UserController.create);
router.get('/', auth, requireRole('leader'), listValidation, UserController.list);
router.get('/:id', auth, requireRole('leader'), UserController.getById);
router.put('/:id', auth, requireRole('leader'), updateUserValidation, UserController.update);
router.put('/:id/change-password', auth, requireRole('leader'), sensitiveLimiter, changePasswordValidation, UserController.changePassword);
router.delete('/:id', auth, requireLeaderForDeactivation, sensitiveLimiter, UserController.deactivate);
router.patch('/:id/reactivate', auth, requireRole('leader'), UserController.reactivate);
router.delete('/:id/permanent', auth, requireRole('leader'), sensitiveLimiter, UserController.permanentDelete);

module.exports = router;