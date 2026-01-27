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
    .isLength({ min: 3, max: 200 })
    .withMessage('Título deve ter entre 3 e 200 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),
  body('event_type_id')
    .isInt({ min: 1 })
    .withMessage('Tipo de evento deve ser válido'),
  body('date')
    .isISO8601()
    .withMessage('Data deve ser válida'),
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Horário deve estar no formato HH:MM'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Local deve ter no máximo 200 caracteres'),
  body('duration_minutes')
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
router.post('/', auth, requireRole('leader'), createEventValidation, EventController.create);
router.get('/', auth, listValidation, EventController.list);
router.get('/calendar', auth, EventController.getCalendar);
router.get('/:id', auth, EventController.getById);
router.put('/:id', auth, requireRole('leader'), createEventValidation, EventController.update);
router.delete('/:id', auth, requireRole('leader'), EventController.delete);

// Rotas de confirmação de presença
router.post('/:id/confirmations', auth, confirmationValidation, ConfirmationController.create);
router.get('/:id/confirmations', auth, ConfirmationController.getByEvent);

module.exports = router;