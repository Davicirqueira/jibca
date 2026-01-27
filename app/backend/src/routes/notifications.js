const express = require('express');
const { query } = require('express-validator');
const NotificationController = require('../controllers/NotificationController');
const { auth } = require('../middleware/auth');

const router = express.Router();

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
  query('unread_only')
    .optional()
    .isBoolean()
    .withMessage('unread_only deve ser true ou false')
];

// Rotas de notificações
router.get('/', auth, listValidation, NotificationController.list);
router.put('/:id/read', auth, NotificationController.markAsRead);
router.put('/read-all', auth, NotificationController.markAllAsRead);

module.exports = router;