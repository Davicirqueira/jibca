const { query, transaction } = require('../config/database');

class ConfirmationRepository {
  /**
   * Criar ou atualizar confirmação de presença
   * @param {Object} confirmationData - Dados da confirmação
   * @returns {Object} Confirmação criada/atualizada
   */
  static async createOrUpdate(confirmationData) {
    const { event_id, user_id, status } = confirmationData;

    const result = await query(`
      INSERT INTO confirmations (event_id, user_id, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (event_id, user_id)
      DO UPDATE SET 
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, event_id, user_id, status, confirmed_at, updated_at
    `, [event_id, user_id, status]);

    return result.rows[0];
  }

  /**
   * Buscar confirmação específica
   * @param {number} eventId - ID do evento
   * @param {number} userId - ID do usuário
   * @returns {Object|null} Confirmação encontrada ou null
   */
  static async findByEventAndUser(eventId, userId) {
    const result = await query(`
      SELECT 
        c.id, c.event_id, c.user_id, c.status, c.confirmed_at, c.updated_at,
        u.name as user_name, u.email as user_email
      FROM confirmations c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.event_id = $1 AND c.user_id = $2
    `, [eventId, userId]);

    return result.rows[0] || null;
  }

  /**
   * Listar confirmações de um evento
   * @param {number} eventId - ID do evento
   * @param {Object} options - Opções de listagem
   * @returns {Object} Lista de confirmações com estatísticas
   */
  static async listByEvent(eventId, options = {}) {
    const { status = null, include_user_details = true } = options;

    let whereClause = 'WHERE c.event_id = $1';
    let params = [eventId];

    if (status) {
      whereClause += ' AND c.status = $2';
      params.push(status);
    }

    const userJoin = include_user_details 
      ? 'LEFT JOIN users u ON c.user_id = u.id'
      : '';

    const userFields = include_user_details
      ? ', u.name as user_name, u.email as user_email, u.phone as user_phone'
      : '';

    // Buscar confirmações
    const confirmationsResult = await query(`
      SELECT 
        c.id, c.event_id, c.user_id, c.status, c.confirmed_at, c.updated_at
        ${userFields}
      FROM confirmations c
      ${userJoin}
      ${whereClause}
      ORDER BY c.updated_at DESC
    `, params);

    // Buscar estatísticas
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'declined' THEN 1 END) as declined,
        COUNT(CASE WHEN status = 'maybe' THEN 1 END) as maybe
      FROM confirmations
      WHERE event_id = $1
    `, [eventId]);

    return {
      confirmations: confirmationsResult.rows,
      stats: statsResult.rows[0]
    };
  }

  /**
   * Listar confirmações de um usuário
   * @param {number} userId - ID do usuário
   * @param {Object} options - Opções de listagem
   * @returns {Array} Lista de confirmações do usuário
   */
  static async listByUser(userId, options = {}) {
    const { 
      status = null, 
      future_only = true,
      limit = null,
      include_event_details = true 
    } = options;

    let whereConditions = ['c.user_id = $1'];
    let params = [userId];
    let paramIndex = 2;

    if (status) {
      whereConditions.push(`c.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (future_only) {
      whereConditions.push('e.date >= CURRENT_DATE');
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const eventJoin = include_event_details
      ? `LEFT JOIN events e ON c.event_id = e.id
         LEFT JOIN event_types et ON e.event_type_id = et.id`
      : '';

    const eventFields = include_event_details
      ? `, e.title as event_title, e.description as event_description, 
          e.date as event_date, e.time as event_time, e.location as event_location,
          et.name as event_type_name, et.color as event_type_color`
      : '';

    let limitClause = '';
    if (limit) {
      limitClause = `LIMIT $${paramIndex}`;
      params.push(limit);
    }

    const result = await query(`
      SELECT 
        c.id, c.event_id, c.user_id, c.status, c.confirmed_at, c.updated_at
        ${eventFields}
      FROM confirmations c
      ${eventJoin}
      ${whereClause}
      ORDER BY e.date ASC, e.time ASC
      ${limitClause}
    `, params);

    return result.rows;
  }

  /**
   * Excluir confirmação
   * @param {number} eventId - ID do evento
   * @param {number} userId - ID do usuário
   * @returns {boolean} True se excluída com sucesso
   */
  static async delete(eventId, userId) {
    const result = await query(
      'DELETE FROM confirmations WHERE event_id = $1 AND user_id = $2',
      [eventId, userId]
    );

    return result.rowCount > 0;
  }

  /**
   * Obter estatísticas de confirmação por evento
   * @param {number} eventId - ID do evento
   * @returns {Object} Estatísticas detalhadas
   */
  static async getEventStats(eventId) {
    const result = await query(`
      SELECT 
        COUNT(*) as total_confirmations,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
        COUNT(CASE WHEN status = 'declined' THEN 1 END) as declined_count,
        COUNT(CASE WHEN status = 'maybe' THEN 1 END) as maybe_count,
        ROUND(
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(*), 0), 2
        ) as confirmation_rate
      FROM confirmations
      WHERE event_id = $1
    `, [eventId]);

    return result.rows[0];
  }

  /**
   * Obter usuários confirmados para um evento (para notificações)
   * @param {number} eventId - ID do evento
   * @param {string} status - Status da confirmação ('confirmed', 'declined', 'maybe')
   * @returns {Array} Lista de usuários
   */
  static async getUsersByEventAndStatus(eventId, status) {
    const result = await query(`
      SELECT 
        u.id, u.name, u.email, u.phone,
        c.status, c.confirmed_at
      FROM confirmations c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.event_id = $1 AND c.status = $2 AND u.is_active = true
      ORDER BY u.name
    `, [eventId, status]);

    return result.rows;
  }

  /**
   * Contar confirmações por usuário
   * @param {number} userId - ID do usuário
   * @returns {Object} Estatísticas do usuário
   */
  static async getUserStats(userId) {
    const result = await query(`
      SELECT 
        COUNT(*) as total_confirmations,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
        COUNT(CASE WHEN status = 'declined' THEN 1 END) as declined_count,
        COUNT(CASE WHEN status = 'maybe' THEN 1 END) as maybe_count,
        COUNT(CASE WHEN e.date >= CURRENT_DATE THEN 1 END) as future_confirmations
      FROM confirmations c
      LEFT JOIN events e ON c.event_id = e.id
      WHERE c.user_id = $1
    `, [userId]);

    return result.rows[0];
  }

  /**
   * Buscar eventos com maior taxa de confirmação
   * @param {number} limit - Limite de resultados
   * @returns {Array} Lista de eventos ordenados por taxa de confirmação
   */
  static async getTopConfirmedEvents(limit = 10) {
    const result = await query(`
      SELECT 
        e.id, e.title, e.date, e.time,
        COUNT(c.id) as total_confirmations,
        COUNT(CASE WHEN c.status = 'confirmed' THEN 1 END) as confirmed_count,
        ROUND(
          COUNT(CASE WHEN c.status = 'confirmed' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(c.id), 0), 2
        ) as confirmation_rate
      FROM events e
      LEFT JOIN confirmations c ON e.id = c.event_id
      WHERE e.date >= CURRENT_DATE
      GROUP BY e.id
      HAVING COUNT(c.id) > 0
      ORDER BY confirmation_rate DESC, confirmed_count DESC
      LIMIT $1
    `, [limit]);

    return result.rows;
  }

  /**
   * Verificar se usuário já confirmou presença em evento
   * @param {number} eventId - ID do evento
   * @param {number} userId - ID do usuário
   * @returns {boolean} True se já confirmou
   */
  static async hasUserConfirmed(eventId, userId) {
    const result = await query(
      'SELECT id FROM confirmations WHERE event_id = $1 AND user_id = $2',
      [eventId, userId]
    );

    return result.rows.length > 0;
  }

  /**
   * Buscar confirmações recentes
   * @param {number} limit - Limite de resultados
   * @returns {Array} Lista de confirmações recentes
   */
  static async getRecentConfirmations(limit = 20) {
    const result = await query(`
      SELECT 
        c.id, c.status, c.confirmed_at, c.updated_at,
        u.name as user_name,
        e.title as event_title, e.date as event_date, e.time as event_time
      FROM confirmations c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN events e ON c.event_id = e.id
      WHERE e.date >= CURRENT_DATE
      ORDER BY c.updated_at DESC
      LIMIT $1
    `, [limit]);

    return result.rows;
  }

  /**
   * Atualizar status de confirmação
   * @param {number} confirmationId - ID da confirmação
   * @param {string} newStatus - Novo status
   * @returns {Object|null} Confirmação atualizada ou null
   */
  static async updateStatus(confirmationId, newStatus) {
    const result = await query(`
      UPDATE confirmations 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, event_id, user_id, status, confirmed_at, updated_at
    `, [newStatus, confirmationId]);

    return result.rows[0] || null;
  }

  /**
   * Buscar estatísticas gerais de confirmações
   * @returns {Object} Estatísticas gerais
   */
  static async getGeneralStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_confirmations,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as total_confirmed,
        COUNT(CASE WHEN status = 'declined' THEN 1 END) as total_declined,
        COUNT(CASE WHEN status = 'maybe' THEN 1 END) as total_maybe,
        COUNT(DISTINCT event_id) as events_with_confirmations,
        COUNT(DISTINCT user_id) as users_who_confirmed,
        ROUND(AVG(
          CASE WHEN status = 'confirmed' THEN 1.0 
               WHEN status = 'maybe' THEN 0.5 
               ELSE 0 END
        ) * 100, 2) as average_engagement_rate
      FROM confirmations c
      LEFT JOIN events e ON c.event_id = e.id
      WHERE e.date >= CURRENT_DATE - INTERVAL '30 days'
    `);

    return result.rows[0];
  }
}

module.exports = ConfirmationRepository;
module.exports = {};