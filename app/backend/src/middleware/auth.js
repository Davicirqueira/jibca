const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware principal de autenticação
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Token de acesso não fornecido'
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário no banco para verificar se ainda está ativo
    const userResult = await query(
      'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Usuário não encontrado'
        }
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_INACTIVE',
          message: 'Usuário desativado'
        }
      });
    }

    // Adicionar dados do usuário à requisição
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token inválido'
        }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token expirado'
        }
      });
    }

    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Erro interno de autenticação'
      }
    });
  }
};

// Middleware para verificar role específica
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'Usuário não autenticado'
        }
      });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Acesso restrito a usuários com perfil ${requiredRole}`
        }
      });
    }

    next();
  };
};

// Middleware para verificar se é o próprio usuário ou líder
const requireOwnershipOrLeader = (req, res, next) => {
  const targetUserId = parseInt(req.params.id);
  
  if (req.user.role === 'leader' || req.user.id === targetUserId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: {
      code: 'ACCESS_DENIED',
      message: 'Acesso negado: você só pode acessar seus próprios dados'
    }
  });
};

module.exports = {
  auth,
  requireRole,
  requireOwnershipOrLeader
};