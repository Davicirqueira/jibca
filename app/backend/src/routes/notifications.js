const express = require('express');
const { query, body } = require('express-validator');
const NotificationController = require('../controllers/NotificationController');
const { auth, requireRole } = require('../middleware/auth');

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
    .withMessage('unread_only deve ser true ou false'),
  query('type')
    .optional()
    .isIn(['event_reminder', 'new_event', 'event_updated', 'custom'])
    .withMessage('Tipo deve ser válido')
];

// Validações para envio de notificação personalizada
const sendNotificationValidation = [
  body('user_ids')
    .isArray({ min: 1 })
    .withMessage('Lista de IDs de usuários deve ser fornecida'),
  body('user_ids.*')
    .isInt({ min: 1 })
    .withMessage('IDs de usuários devem ser números válidos'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Mensagem deve ter entre 1 e 500 caracteres'),
  body('type')
    .optional()
    .isIn(['event_reminder', 'new_event', 'event_updated', 'custom'])
    .withMessage('Tipo deve ser válido'),
  body('event_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do evento deve ser um número válido')
];

// Rotas de notificações
router.get('/unread-count', auth, NotificationController.getUnreadCount);
router.get('/my-stats', auth, NotificationController.getMyStats);
router.get('/system-stats', auth, requireRole('leader'), NotificationController.getSystemStats);
router.get('/health', auth, requireRole('leader'), NotificationController.getHealthStatus);
router.get('/', auth, listValidation, NotificationController.list);
router.put('/read-all', auth, NotificationController.markAllAsRead);
router.put('/:id/read', auth, NotificationController.markAsRead);
router.delete('/:id', auth, NotificationController.delete);

// Rotas administrativas (apenas Líder)
router.post('/send', auth, requireRole('leader'), sendNotificationValidation, NotificationController.sendCustomNotification);
router.post('/test', auth, requireRole('leader'), NotificationController.testSystem);

module.exports = router;