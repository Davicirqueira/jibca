const rateLimit = require('express-rate-limit');

// Helper para normalizar IPs IPv6
const standardIpv6NormalizedKeyGenerator = (req, res) => {
  return res.locals.standardIpv6NormalizedIp || req.ip;
};

// Rate limiter geral para todas as rotas
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requisições por IP
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Muitas requisições. Tente novamente mais tarde.'
    }
  },
  standardHeaders: true, // Retorna headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  handler: (req, res) => {
    console.warn(`Rate limit excedido para IP: ${req.ip} - Rota: ${req.path}`);
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Muitas requisições. Tente novamente mais tarde.',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000)
      }
    });
  }
});

// Rate limiter específico para autenticação (mais restritivo)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5, // 5 tentativas de login
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_LOGIN_ATTEMPTS',
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Não contar requisições bem-sucedidas
  handler: (req, res) => {
    console.warn(`Rate limit de auth excedido para IP: ${req.ip} - Email: ${req.body?.email || 'N/A'}`);
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_LOGIN_ATTEMPTS',
        message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000)
      }
    });
  }
});

// Rate limiter para recuperação de senha (muito restritivo)
const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: parseInt(process.env.RESET_PASSWORD_RATE_LIMIT_MAX) || 3, // 3 solicitações por hora
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_RESET_REQUESTS',
      message: 'Muitas solicitações de recuperação de senha. Tente novamente em 1 hora.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Usar email como chave para reset de senha (além do IP normalizado para IPv6)
    const normalizedIp = standardIpv6NormalizedKeyGenerator(req, res);
    return `${normalizedIp}-${req.body?.email || 'unknown'}`;
  },
  handler: (req, res) => {
    console.warn(`Rate limit de reset password excedido para IP: ${req.ip} - Email: ${req.body?.email || 'N/A'}`);
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_RESET_REQUESTS',
        message: 'Muitas solicitações de recuperação de senha. Tente novamente em 1 hora.',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000)
      }
    });
  }
});

// Rate limiter para criação de recursos (moderado)
const createResourceLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 20, // 20 criações por 10 minutos
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_CREATIONS',
      message: 'Muitas criações de recursos. Aguarde alguns minutos.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Rate limit de criação excedido para IP: ${req.ip} - Rota: ${req.path}`);
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_CREATIONS',
        message: 'Muitas criações de recursos. Aguarde alguns minutos.',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000)
      }
    });
  }
});

// Rate limiter para APIs sensíveis (exclusão, alteração de senha)
const sensitiveLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutos
  max: 10, // 10 operações sensíveis por 30 minutos
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_SENSITIVE_OPERATIONS',
      message: 'Muitas operações sensíveis. Aguarde 30 minutos.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Rate limit de operações sensíveis excedido para IP: ${req.ip} - Rota: ${req.path} - User: ${req.user?.id || 'N/A'}`);
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_SENSITIVE_OPERATIONS',
        message: 'Muitas operações sensíveis. Aguarde 30 minutos.',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000)
      }
    });
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  resetPasswordLimiter,
  createResourceLimiter,
  sensitiveLimiter
};