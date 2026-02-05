require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const confirmationRoutes = require('./routes/confirmations');
const notificationRoutes = require('./routes/notifications');
const dashboardRoutes = require('./routes/dashboard');
const NotificationService = require('./services/NotificationService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/confirmations', confirmationRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'JIBCA Agenda Backend'
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos fornecidos',
        details: err.details || []
      }
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token de acesso inválido ou expirado'
      }
    });
  }

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Erro interno do servidor'
    }
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Rota não encontrada'
    }
  });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor JIBCA Agenda rodando na porta ${PORT}`);
  console.log(`📅 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  
  // Iniciar agendador de notificações após um pequeno delay
  setTimeout(() => {
    try {
      NotificationService.startNotificationScheduler();
      console.log('📬 Sistema de notificações iniciado');
    } catch (error) {
      console.error('❌ Erro ao iniciar sistema de notificações:', error.message);
      console.log('📬 Servidor continuará funcionando sem notificações automáticas');
    }
  }, 2000);
});

module.exports = app;