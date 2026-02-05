const { query } = require('../config/database');
const crypto = require('crypto');

class PasswordResetRepository {
  /**
   * Gerar token único e seguro
   * @returns {string} Token gerado
   */
  static generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Criar novo token de recuperação de senha
   * @param {number} userId - ID do usuário
   * @param {number} expiresInMinutes - Minutos até expiração (padrão: 60)
   * @returns {Object} Token criado
   */
  static async create(userId, expiresInMinutes = 60) {
    try {
      const token = this.generateToken();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

      const result = await query(`
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, token, expires_at, used, created_at
      `, [userId, token, expiresAt]);

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar token de recuperação:', error);
      throw error;
    }
  }

  /**
   * Buscar token válido
   * @param {string} token - Token de recuperação
   * @returns {Object|null} Token encontrado ou null
   */
  static async findValidToken(token) {
    try {
      const result = await query(`
        SELECT 
          prt.id,
          prt.user_id,
          prt.token,
          prt.expires_at,
          prt.used,
          prt.used_at,
          prt.created_at,
          u.email,
          u.name,
          u.is_active
        FROM password_reset_tokens prt
        INNER JOIN users u ON prt.user_id = u.id
        WHERE prt.token = $1
          AND prt.used = false
          AND prt.expires_at > CURRENT_TIMESTAMP
      `, [token]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar token:', error);
      throw error;
    }
  }

  /**
   * Marcar token como usado
   * @param {string} token - Token de recuperação
   * @returns {boolean} True se marcado com sucesso
   */
  static async markAsUsed(token) {
    try {
      const result = await query(`
        UPDATE password_reset_tokens
        SET used = true, used_at = CURRENT_TIMESTAMP
        WHERE token = $1
      `, [token]);

      return result.rowCount > 0;
    } catch (error) {
      console.error('Erro ao marcar token como usado:', error);
      throw error;
    }
  }

  /**
   * Invalidar todos os tokens de um usuário
   * @param {number} userId - ID do usuário
   * @returns {number} Número de tokens invalidados
   */
  static async invalidateUserTokens(userId) {
    try {
      const result = await query(`
        UPDATE password_reset_tokens
        SET used = true, used_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND used = false
      `, [userId]);

      return result.rowCount;
    } catch (error) {
      console.error('Erro ao invalidar tokens do usuário:', error);
      throw error;
    }
  }

  /**
   * Limpar tokens expirados (para cron job)
   * @returns {number} Número de tokens removidos
   */
  static async cleanExpiredTokens() {
    try {
      const result = await query(`
        DELETE FROM password_reset_tokens
        WHERE expires_at < CURRENT_TIMESTAMP
          OR (used = true AND used_at < CURRENT_TIMESTAMP - INTERVAL '7 days')
      `);

      console.log(`🧹 Tokens expirados removidos: ${result.rowCount}`);
      return result.rowCount;
    } catch (error) {
      console.error('Erro ao limpar tokens expirados:', error);
      throw error;
    }
  }

  /**
   * Contar tokens ativos de um usuário
   * @param {number} userId - ID do usuário
   * @returns {number} Número de tokens ativos
   */
  static async countActiveTokens(userId) {
    try {
      const result = await query(`
        SELECT COUNT(*) as count
        FROM password_reset_tokens
        WHERE user_id = $1
          AND used = false
          AND expires_at > CURRENT_TIMESTAMP
      `, [userId]);

      return parseInt(result.rows[0].count) || 0;
    } catch (error) {
      console.error('Erro ao contar tokens ativos:', error);
      throw error;
    }
  }
}

module.exports = PasswordResetRepository;
