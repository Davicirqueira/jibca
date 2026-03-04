require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/profile');
const eventRoutes = require('./routes/events');
const confirmationRoutes = require('./routes/confirmations');
const notificationRoutes = require('./routes/notifications');
const dashboardRoutes = require('./routes/dashboard');
const NotificationService = require('./services/NotificationService');
const EmailService = require('./services/EmailService');
const { generalLimiter } = require('./middleware/rateLimiter');
const { sanitizationLogger } = require('./middleware/sanitizer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting geral
app.use(generalLimiter);

// Middleware para parsing
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Verificar se o JSON é válido
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'JSON inválido no corpo da requisição'
        }
      });
      return;
    }
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de sanitização (apenas em desenvolvimento para logs)
if (process.env.NODE_ENV === 'development') {
  app.use(sanitizationLogger);
}

// Rotas da API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/confirmations', confirmationRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'JIBCA Agenda Backend',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Log detalhado em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack trace:', err.stack);
    console.error('Request details:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    });
  }
  
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

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'Arquivo muito grande'
      }
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'JSON inválido no corpo da requisição'
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
app.listen(PORT, async () => {
  console.log(`🚀 Servidor JIBCA Agenda rodando na porta ${PORT}`);
  console.log(`📅 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Rate limiting ativo: ${generalLimiter ? 'Sim' : 'Não'}`);
  console.log(`🛡️  Helmet security ativo: Sim`);
  
  // Inicializar serviço de email
  try {
    await EmailService.initialize();
  } catch (error) {
    console.error('❌ Erro ao inicializar serviço de email:', error.message);
  }
  
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