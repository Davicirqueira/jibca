const express = require('express');
const { body, query } = require('express-validator');
const UserController = require('../controllers/UserController');
const { auth, requireRole, requireLeaderForDeactivation } = require('../middleware/auth');

const router = express.Router();

// Validações para criação de usuário
const createUserValidation = [
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
    .isMobilePhone('pt-BR')
    .withMessage('Telefone deve ser válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
];

// Validações para atualização de usuário
const updateUserValidation = [
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
    .isMobilePhone('pt-BR')
    .withMessage('Telefone deve ser válido')
];

// Validações para listagem
const listValidation = [
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
router.post('/', auth, requireRole('leader'), createUserValidation, UserController.create);
router.get('/', auth, requireRole('leader'), listValidation, UserController.list);
router.get('/:id', auth, requireRole('leader'), UserController.getById);
router.put('/:id', auth, requireRole('leader'), updateUserValidation, UserController.update);
router.delete('/:id', auth, requireLeaderForDeactivation, UserController.deactivate);
router.patch('/:id/reactivate', auth, requireRole('leader'), UserController.reactivate);
router.delete('/:id/permanent', auth, requireRole('leader'), UserController.permanentDelete);

module.exports = router;