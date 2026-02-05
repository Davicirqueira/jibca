const express = require('express');
const DashboardController = require('../controllers/DashboardController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Rota para métricas básicas do dashboard
router.get('/metrics', auth, DashboardController.getMetrics);

// Rota para estatísticas detalhadas (opcional)
router.get('/stats', auth, DashboardController.getDetailedStats);

module.exports = router;