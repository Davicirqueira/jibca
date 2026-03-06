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
            role: user.role,
            phone: user.phone,
            avatar_url: user.avatar_url,
            is_active: user.is_active,
            created_at: user.created_at,
            updated_at: user.updated_at
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

  /**
   * Solicitar recuperação de senha
   * POST /api/v1/auth/forgot-password
   */
  static async forgotPassword(req, res) {
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

      const { email } = req.body;

      // Gerar token de recuperação
      const resetData = await AuthService.generateResetToken(email);

      // Enviar email de recuperação
      const EmailService = require('../services/EmailService');
      const emailResult = await EmailService.sendPasswordResetEmail(
        email,
        resetData.token,
        resetData.user.name
      );

      // Notificar líderes sobre a solicitação
      const NotificationService = require('../services/NotificationService');
      const UserRepository = require('../repositories/UserRepository');

      // Buscar todos os líderes ativos
      const leaders = await UserRepository.list({
        role: 'leader',
        is_active: true,
        limit: 100
      });

      if (leaders.users && leaders.users.length > 0) {
        const leaderIds = leaders.users.map(leader => leader.id);
        
        // Criar notificação para os líderes incluindo status do email
        const emailStatus = emailResult.success ? 'Email enviado com sucesso' : 'Falha no envio do email';
        const message = `${resetData.user.name} (${email}) solicitou alteração de senha. ${emailStatus}.`;
        
        await NotificationService.sendCustomNotification(
          leaderIds,
          message,
          'new_event',
          null
        );

        console.log(`📬 Notificação de recuperação de senha enviada para ${leaderIds.length} líder(es) - Usuário: ${resetData.user.name} (${email})`);
      }

      // Em desenvolvimento, retornar informações adicionais
      const isDevelopment = process.env.NODE_ENV === 'development';

      res.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá um link de recuperação.',
        data: isDevelopment ? {
          user: resetData.user.name,
          email: email,
          emailSent: emailResult.success,
          leadersNotified: leaders.users ? leaders.users.length : 0,
          timestamp: new Date().toISOString()
        } : undefined
      });

    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);

      // Por segurança, sempre retornar a mesma mensagem
      // Não revelar se o email existe ou não
      if (error.message === 'USER_NOT_FOUND' || error.message === 'USER_INACTIVE') {
        return res.json({
          success: true,
          message: 'Solicitação de alteração de senha enviada para os líderes. Aguarde o contato.'
        });
      }

      if (error.message === 'TOO_MANY_REQUESTS') {
        return res.status(429).json({
          success: false,
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Muitas solicitações de recuperação. Tente novamente em 1 hora.'
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'FORGOT_PASSWORD_ERROR',
          message: 'Erro interno ao processar solicitação'
        }
      });
    }
  }

  /**
   * Validar token de recuperação
   * GET /api/v1/auth/validate-reset-token/:token
   */
  static async validateResetToken(req, res) {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'TOKEN_REQUIRED',
            message: 'Token é obrigatório'
          }
        });
      }

      // Validar token
      const tokenData = await AuthService.validateResetToken(token);

      res.json({
        success: true,
        data: {
          valid: true,
          email: tokenData.email,
          expiresAt: tokenData.expiresAt
        }
      });

    } catch (error) {
      console.error('Erro ao validar token:', error);

      if (error.message === 'INVALID_TOKEN') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token inválido ou expirado'
          }
        });
      }

      if (error.message === 'USER_INACTIVE') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'USER_INACTIVE',
            message: 'Usuário desativado'
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'VALIDATE_TOKEN_ERROR',
          message: 'Erro interno ao validar token'
        }
      });
    }
  }

  /**
   * Redefinir senha
   * POST /api/v1/auth/reset-password
   */
  static async resetPassword(req, res) {
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

      const { token, newPassword, confirmPassword } = req.body;

      // Validar se senhas coincidem
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PASSWORDS_DONT_MATCH',
            message: 'As senhas não coincidem'
          }
        });
      }

      // Redefinir senha
      const result = await AuthService.resetPassword(token, newPassword);

      res.json({
        success: true,
        message: 'Senha redefinida com sucesso! Você já pode fazer login.',
        data: {
          email: result.email
        }
      });

    } catch (error) {
      console.error('Erro ao redefinir senha:', error);

      if (error.message === 'INVALID_TOKEN') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token inválido ou expirado'
          }
        });
      }

      if (error.message === 'USER_INACTIVE') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'USER_INACTIVE',
            message: 'Usuário desativado'
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'RESET_PASSWORD_ERROR',
          message: 'Erro interno ao redefinir senha'
        }
      });
    }
  }
}

module.exports = AuthController;