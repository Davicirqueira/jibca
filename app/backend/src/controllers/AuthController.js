const { validationResult } = require('express-validator');
const AuthService = require('../services/AuthService');

class AuthController {
  /**
   * Login de usuário
   * POST /api/v1/auth/login
   */
  static async login(req, res) {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados inválidos fornecidos',
            details: errors.array()
          }
        });
      }

      const { email, password } = req.body;

      // Autenticar usuário
      const authResult = await AuthService.login(email, password);

      res.json({
        success: true,
        data: {
          user: authResult.user,
          token: authResult.token
        },
        message: 'Login realizado com sucesso'
      });

    } catch (error) {
      console.error('Erro no login:', error);

      if (error.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Email ou senha incorretos'
          }
        });
      }

      if (error.message === 'USER_INACTIVE') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'USER_INACTIVE',
            message: 'Usuário desativado. Entre em contato com o líder.'
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: 'Erro interno no processo de login'
        }
      });
    }
  }

  /**
   * Logout de usuário
   * POST /api/v1/auth/logout
   */
  static async logout(req, res) {
    try {
      // Em uma implementação mais robusta, poderíamos:
      // 1. Adicionar token a uma blacklist
      // 2. Invalidar refresh tokens
      // 3. Registrar logout em logs de auditoria

      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });

    } catch (error) {
      console.error('Erro no logout:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: 'Erro interno no processo de logout'
        }
      });
    }
  }

  /**
   * Obter perfil do usuário autenticado
   * GET /api/v1/auth/me
   */
  static async getProfile(req, res) {
    try {
      // O middleware de auth já validou o token e adicionou req.user
      const user = req.user;

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });

    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'PROFILE_ERROR',
          message: 'Erro interno ao buscar perfil'
        }
      });
    }
  }

  /**
   * Verificar saúde da autenticação
   * GET /api/v1/auth/health
   */
  static async healthCheck(req, res) {
    try {
      // Verificar se JWT_SECRET está configurado
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'JWT_NOT_CONFIGURED',
            message: 'JWT_SECRET não configurado'
          }
        });
      }

      res.json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          jwt_configured: !!process.env.JWT_SECRET
        }
      });

    } catch (error) {
      console.error('Erro no health check de auth:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'HEALTH_CHECK_ERROR',
          message: 'Erro no health check'
        }
      });
    }
  }
}

module.exports = AuthController;