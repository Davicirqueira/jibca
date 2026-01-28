const express = require('express');
const { query } = require('express-validator');
const ConfirmationController = require('../controllers/ConfirmationController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Validações para listagem
const listValidation = [
  query('status')
    .optional()
    .isIn(['confirmed', 'declined', 'maybe'])
    .withMessage('Status deve ser: confirmed, declined ou maybe'),
  query('future_only')
    .optional()
    .isBoolean()
    .withMessage('future_only deve ser true ou false'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser entre 1 e 100')
];

// Rotas de confirmações
router.get('/me', auth, listValidation, ConfirmationController.getMyConfirmations);
router.get('/my-stats', auth, ConfirmationController.getMyStats);
router.get('/stats', auth, requireRole('leader'), ConfirmationController.getStats);

module.exports = router;