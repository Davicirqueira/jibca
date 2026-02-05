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

// Middleware para verificar se é líder E não está tentando desativar a si mesmo ou outro líder
const requireLeaderForDeactivation = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id);
    
    // Verificar se é líder
    if (req.user.role !== 'leader') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Apenas líderes podem desativar membros'
        }
      });
    }

    // Verificar se não está tentando desativar a si mesmo
    if (req.user.id === targetUserId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_DEACTIVATE_SELF',
          message: 'Você não pode desativar sua própria conta'
        }
      });
    }

    // Verificar se o usuário alvo existe e não é líder
    const { query } = require('../config/database');
    const result = await query('SELECT role, is_active FROM users WHERE id = $1', [targetUserId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Usuário não encontrado'
        }
      });
    }

    const targetUser = result.rows[0];
    
    if (targetUser.role === 'leader') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_DEACTIVATE_LEADER',
          message: 'Não é possível desativar outros líderes'
        }
      });
    }

    if (!targetUser.is_active) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_ALREADY_INACTIVE',
          message: 'Este usuário já está desativado'
        }
      });
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de verificação de desativação:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PERMISSION_CHECK_ERROR',
        message: 'Erro interno ao verificar permissões'
      }
    });
  }
};

module.exports = {
  auth,
  requireRole,
  requireLeaderForDeactivation
};