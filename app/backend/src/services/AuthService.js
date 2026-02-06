const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

class AuthService {
  /**
   * Autentica um usuário com email e senha
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Object} Dados do usuário e token JWT
   */
  static async login(email, password) {
    try {
      // Buscar usuário por email
      const userResult = await query(
        'SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (userResult.rows.length === 0) {
        throw new Error('INVALID_CREDENTIALS');
      }

      const user = userResult.rows[0];

      // Verificar se usuário está ativo
      if (!user.is_active) {
        throw new Error('USER_INACTIVE');
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('INVALID_CREDENTIALS');
      }

      // Gerar token JWT
      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { 
          expiresIn: process.env.JWT_EXPIRES_IN || '24h',
          issuer: 'jibca-agenda',
          audience: 'jibca-members'
        }
      );

      // Retornar dados do usuário (sem senha) e token
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      };

    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  /**
   * Valida um token JWT
   * @param {string} token - Token JWT
   * @returns {Object} Dados decodificados do token
   */
  static async validateToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verificar se usuário ainda existe e está ativo
      const userResult = await query(
        'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('USER_NOT_FOUND');
      }

      const user = userResult.rows[0];

      if (!user.is_active) {
        throw new Error('USER_INACTIVE');
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new Error('INVALID_TOKEN');
      }
      if (error.name === 'TokenExpiredError') {
        throw new Error('TOKEN_EXPIRED');
      }
      throw error;
    }
  }

  /**
   * Gera hash de senha
   * @param {string} password - Senha em texto plano
   * @returns {string} Hash da senha
   */
  static async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compara senha com hash
   * @param {string} password - Senha em texto plano
   * @param {string} hash - Hash armazenado
   * @returns {boolean} True se a senha confere
   */
  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Verifica se usuário tem permissão para uma operação
   * @param {Object} user - Dados do usuário
   * @param {string} requiredRole - Role necessária
   * @param {number} resourceUserId - ID do usuário dono do recurso (opcional)
   * @returns {boolean} True se tem permissão
   */
  static hasPermission(user, requiredRole, resourceUserId = null) {
    // Líder tem acesso a tudo
    if (user.role === 'leader') {
      return true;
    }

    // Verificar role específica
    if (requiredRole && user.role !== requiredRole) {
      return false;
    }

    // Verificar se é o próprio usuário
    if (resourceUserId && user.id !== resourceUserId) {
      return false;
    }

    return true;
  }

  /**
   * Gera token de recuperação de senha
   * @param {string} email - Email do usuário
   * @returns {Object} Token e dados do usuário
   */
  static async generateResetToken(email) {
    const PasswordResetRepository = require('../repositories/PasswordResetRepository');
    
    try {
      // Buscar usuário por email
      const userResult = await query(
        'SELECT id, name, email, is_active FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (userResult.rows.length === 0) {
        throw new Error('USER_NOT_FOUND');
      }

      const user = userResult.rows[0];

      // Verificar se usuário está ativo
      if (!user.is_active) {
        throw new Error('USER_INACTIVE');
      }

      // Verificar se já existe token ativo (limite de 3 tokens por hora)
      const activeTokens = await PasswordResetRepository.countActiveTokens(user.id);
      if (activeTokens >= 3) {
        throw new Error('TOO_MANY_REQUESTS');
      }

      // Criar token de recuperação (válido por 60 minutos)
      const resetToken = await PasswordResetRepository.create(user.id, 60);

      return {
        token: resetToken.token,
        expiresAt: resetToken.expires_at,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      };

    } catch (error) {
      console.error('Erro ao gerar token de recuperação:', error);
      throw error;
    }
  }

  /**
   * Valida token de recuperação de senha
   * @param {string} token - Token de recuperação
   * @returns {Object} Dados do token e usuário
   */
  static async validateResetToken(token) {
    const PasswordResetRepository = require('../repositories/PasswordResetRepository');
    
    try {
      const resetToken = await PasswordResetRepository.findValidToken(token);

      if (!resetToken) {
        throw new Error('INVALID_TOKEN');
      }

      // Verificar se usuário ainda está ativo
      if (!resetToken.is_active) {
        throw new Error('USER_INACTIVE');
      }

      return {
        userId: resetToken.user_id,
        email: resetToken.email,
        name: resetToken.name,
        expiresAt: resetToken.expires_at
      };

    } catch (error) {
      console.error('Erro ao validar token de recuperação:', error);
      throw error;
    }
  }

  /**
   * Redefine senha do usuário usando token
   * @param {string} token - Token de recuperação
   * @param {string} newPassword - Nova senha
   * @returns {Object} Resultado da operação
   */
  static async resetPassword(token, newPassword) {
    const PasswordResetRepository = require('../repositories/PasswordResetRepository');
    
    try {
      // Validar token
      const tokenData = await this.validateResetToken(token);

      // Gerar hash da nova senha
      const passwordHash = await this.hashPassword(newPassword);

      // Atualizar senha do usuário
      await query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [passwordHash, tokenData.userId]
      );

      // Marcar token como usado
      await PasswordResetRepository.markAsUsed(token);

      // Invalidar todos os outros tokens do usuário
      await PasswordResetRepository.invalidateUserTokens(tokenData.userId);

      console.log(`✅ Senha redefinida para usuário: ${tokenData.email} (ID: ${tokenData.userId})`);

      return {
        success: true,
        email: tokenData.email
      };

    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      throw error;
    }
  }

  /**
   * Invalida todos os tokens de recuperação de um usuário
   * @param {number} userId - ID do usuário
   * @returns {boolean} Sucesso da operação
   */
  static async invalidateUserResetTokens(userId) {
    const PasswordResetRepository = require('../repositories/PasswordResetRepository');
    
    try {
      await PasswordResetRepository.invalidateUserTokens(userId);
      console.log(`✅ Tokens de recuperação invalidados para usuário ID: ${userId}`);
      return true;
    } catch (error) {
      console.error('Erro ao invalidar tokens de recuperação:', error);
      throw error;
    }
  }
}

module.exports = AuthService;