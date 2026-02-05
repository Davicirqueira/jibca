const express = require('express');
const { body, query } = require('express-validator');
const EventController = require('../controllers/EventController');
const ConfirmationController = require('../controllers/ConfirmationController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Validações para criação de evento
const createEventValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Título é obrigatório')
    .isLength({ min: 3, max: 200 })
    .withMessage('Título deve ter entre 3 e 200 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),
  body('event_type_id')
    .notEmpty().withMessage('Tipo de evento é obrigatório')
    .isInt({ min: 1 })
    .withMessage('Tipo de evento deve ser um número válido')
    .toInt(), // CRÍTICO: Converter para inteiro
  body('date')
    .notEmpty().withMessage('Data é obrigatória')
    .isISO8601()
    .withMessage('Data deve ser válida no formato ISO 8601 (YYYY-MM-DD)'),
  body('time')
    .notEmpty().withMessage('Horário é obrigatório')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Horário deve estar no formato HH:MM'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Local deve ter no máximo 200 caracteres'),
  body('duration_minutes')
    .optional() // Tornando opcional para permitir default
    .isInt({ min: 15, max: 1440 })
    .withMessage('Duração deve ser entre 15 minutos e 24 horas')
];

// Validações para confirmação
const confirmationValidation = [
  body('status')
    .isIn(['confirmed', 'declined', 'maybe'])
    .withMessage('Status deve ser: confirmed, declined ou maybe')
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
  query('type')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Tipo deve ser um ID válido'),
  query('future_only')
    .optional()
    .isBoolean()
    .withMessage('future_only deve ser true ou false'),
  query('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Mês deve ser entre 1 e 12'),
  query('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Ano deve ser válido')
];

// Rotas de eventos
router.get('/types', auth, EventController.getEventTypes);
router.get('/stats', auth, requireRole('leader'), EventController.getStats);
router.get('/calendar', auth, EventController.getCalendar);
router.post('/', auth, requireRole('leader'), createEventValidation, EventController.create);
router.get('/', auth, listValidation, EventController.list);
router.get('/:id', auth, EventController.getById);
router.put('/:id', auth, requireRole('leader'), createEventValidation, EventController.update);
router.delete('/:id', auth, requireRole('leader'), EventController.delete);

// Rotas de confirmação de presença
router.get('/:id/confirmations/me', auth, ConfirmationController.getMyConfirmation);
router.post('/:id/confirmations', auth, confirmationValidation, ConfirmationController.create);
router.get('/:id/confirmations', auth, ConfirmationController.getByEvent);
router.delete('/:id/confirmations', auth, ConfirmationController.delete);

module.exports = router;