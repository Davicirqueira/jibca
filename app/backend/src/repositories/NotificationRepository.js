const { query, transaction } = require('../config/database');

class NotificationRepository {
  /**
   * Criar nova notificação
   * @param {Object} notificationData - Dados da notificação
   * @returns {Object} Notificação criada
   */
  static async create(notificationData) {
    const { user_id, event_id, type, message } = notificationData;

    const result = await query(`
      INSERT INTO notifications (user_id, event_id, type, message)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, event_id, type, message, sent_at, read_at
    `, [user_id, event_id, type, message]);

    return result.rows[0];
  }

  /**
   * Criar notificações em lote
   * @param {Array} notifications - Array de dados de notificações
   * @returns {Array} Notificações criadas
   */
  static async createBatch(notifications) {
    if (!notifications || notifications.length === 0) {
      return [];
    }

    return await transaction(async (client) => {
      const results = [];
      
      for (const notification of notifications) {
        const { user_id, event_id, type, message } = notification;
        
        const result = await client.query(`
          INSERT INTO notifications (user_id, event_id, type, message)
          VALUES ($1, $2, $3, $4)
          RETURNING id, user_id, event_id, type, message, sent_at, read_at
        `, [user_id, event_id, type, message]);
        
        results.push(result.rows[0]);
      }
      
      return results;
    });
  }

  /**
   * Buscar notificação por ID
   * @param {number} id - ID da notificação
   * @returns {Object|null} Notificação encontrada ou null
   */
  static async findById(id) {
    const result = await query(`
      SELECT 
        n.id, n.user_id, n.event_id, n.type, n.message, n.sent_at, n.read_at,
        e.title as event_title, e.date as event_date, e.time as event_time
      FROM notifications n
      LEFT JOIN events e ON n.event_id = e.id
      WHERE n.id = $1
    `, [id]);

    return result.rows[0] || null;
  }

  /**
   * Listar notificações de um usuário
   * @param {number} userId - ID do usuário
   * @param {Object} options - Opções de listagem
   * @returns {Object} Lista paginada de notificações
   */
  static async listByUser(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      unread_only = false,
      type = null,
      include_event_details = true
    } = options;

    const offset = (page - 1) * limit;
    let whereConditions = ['n.user_id = $1'];
    let params = [userId];
    let paramIndex = 2;

    // Filtro para apenas não lidas
    if (unread_only) {
      whereConditions.push('n.read_at IS NULL');
    }

    // Filtro por tipo
    if (type) {
      whereConditions.push(`n.type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const eventJoin = include_event_details
      ? 'LEFT JOIN events e ON n.event_id = e.id'
      : '';

    const eventFields = include_event_details
      ? ', e.title as event_title, e.date as event_date, e.time as event_time, e.location as event_location'
      : '';

    // Query principal
    const notificationsResult = await query(`
      SELECT 
        n.id, n.user_id, n.event_id, n.type, n.message, n.sent_at, n.read_at
        ${eventFields}
      FROM notifications n
      ${eventJoin}
      ${whereClause}
      ORDER BY n.sent_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    // Query para contar total
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM notifications n
      ${whereClause}
    `, params);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return {
      notifications: notificationsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Marcar notificação como lida
   * @param {number} id - ID da notificação
   * @param {number} userId - ID do usuário (para verificação de propriedade)
   * @returns {Object|null} Notificação atualizada ou null
   */
  static async markAsRead(id, userId) {
    const result = await query(`
      UPDATE notifications 
      SET read_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2 AND read_at IS NULL
      RETURNING id, user_id, event_id, type, message, sent_at, read_at
    `, [id, userId]);

    return result.rows[0] || null;
  }

  /**
   * Marcar todas as notificações de um usuário como lidas
   * @param {number} userId - ID do usuário
   * @returns {number} Número de notificações marcadas como lidas
   */
  static async markAllAsRead(userId) {
    const result = await query(`
      UPDATE notifications 
      SET read_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND read_at IS NULL
    `, [userId]);

    return result.rowCount;
  }

  /**
   * Contar notificações não lidas de um usuário
   * @param {number} userId - ID do usuário
   * @returns {number} Número de notificações não lidas
   */
  static async countUnread(userId) {
    const result = await query(`
      SELECT COUNT(*) as unread_count
      FROM notifications
      WHERE user_id = $1 AND read_at IS NULL
    `, [userId]);

    return parseInt(result.rows[0].unread_count);
  }

  /**
   * Excluir notificação
   * @param {number} id - ID da notificação
   * @param {number} userId - ID do usuário (para verificação de propriedade)
   * @returns {boolean} True se excluída com sucesso
   */
  static async delete(id, userId) {
    const result = await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    return result.rowCount > 0;
  }

  /**
   * Buscar notificações por evento
   * @param {number} eventId - ID do evento
   * @returns {Array} Lista de notificações do evento
   */
  static async findByEvent(eventId) {
    const result = await query(`
      SELECT 
        n.id, n.user_id, n.type, n.message, n.sent_at, n.read_at,
        u.name as user_name, u.email as user_email
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.event_id = $1
      ORDER BY n.sent_at DESC
    `, [eventId]);

    return result.rows;
  }

  /**
   * Verificar se notificação já foi enviada
   * @param {number} userId - ID do usuário
   * @param {number} eventId - ID do evento
   * @param {string} type - Tipo da notificação
   * @returns {boolean} True se já foi enviada
   */
  static async notificationExists(userId, eventId, type) {
    const result = await query(`
      SELECT id FROM notifications
      WHERE user_id = $1 AND event_id = $2 AND type = $3
    `, [userId, eventId, type]);

    return result.rows.length > 0;
  }

  /**
   * Buscar usuários para notificação de lembrete diário
   * @param {number} eventId - ID do evento
   * @returns {Array} Lista de usuários ativos
   */
  static async getUsersForDailyReminder(eventId) {
    const result = await query(`
      SELECT DISTINCT u.id, u.name, u.email
      FROM users u
      WHERE u.is_active = true
        AND NOT EXISTS (
          SELECT 1 FROM notifications n 
          WHERE n.user_id = u.id 
            AND n.event_id = $1 
            AND n.type = 'event_reminder'
            AND n.sent_at >= CURRENT_DATE
        )
      ORDER BY u.name
    `, [eventId]);

    return result.rows;
  }

  /**
   * Buscar usuários confirmados para lembrete de 1 hora
   * @param {number} eventId - ID do evento
   * @returns {Array} Lista de usuários confirmados
   */
  static async getUsersForHourlyReminder(eventId) {
    const result = await query(`
      SELECT DISTINCT u.id, u.name, u.email
      FROM users u
      INNER JOIN confirmations c ON u.id = c.user_id
      WHERE u.is_active = true
        AND c.event_id = $1
        AND c.status = 'confirmed'
        AND NOT EXISTS (
          SELECT 1 FROM notifications n 
          WHERE n.user_id = u.id 
            AND n.event_id = $1 
            AND n.type = 'event_reminder'
            AND n.sent_at >= CURRENT_TIMESTAMP - INTERVAL '2 hours'
        )
      ORDER BY u.name
    `, [eventId]);

    return result.rows;
  }

  /**
   * Obter estatísticas de notificações
   * @param {number} userId - ID do usuário (opcional, para estatísticas específicas)
   * @returns {Object} Estatísticas de notificações
   */
  static async getStats(userId = null) {
    if (userId) {
      // Estatísticas específicas do usuário
      const result = await query(`
        SELECT 
          COUNT(*) as total_notifications,
          COUNT(CASE WHEN read_at IS NULL THEN 1 END) as unread_count,
          COUNT(CASE WHEN read_at IS NOT NULL THEN 1 END) as read_count,
          COUNT(CASE WHEN type = 'event_reminder' THEN 1 END) as reminder_count,
          COUNT(CASE WHEN type = 'new_event' THEN 1 END) as new_event_count,
          COUNT(CASE WHEN type = 'event_updated' THEN 1 END) as updated_event_count,
          COUNT(CASE WHEN sent_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_count
        FROM notifications
        WHERE user_id = $1
      `, [userId]);

      return result.rows[0];
    } else {
      // Estatísticas gerais (apenas para líderes)
      const result = await query(`
        SELECT 
          COUNT(*) as total_notifications,
          COUNT(DISTINCT user_id) as users_notified,
          COUNT(CASE WHEN read_at IS NULL THEN 1 END) as total_unread,
          COUNT(CASE WHEN type = 'event_reminder' THEN 1 END) as total_reminders,
          COUNT(CASE WHEN type = 'new_event' THEN 1 END) as total_new_events,
          COUNT(CASE WHEN type = 'event_updated' THEN 1 END) as total_updates,
          ROUND(AVG(
            CASE WHEN read_at IS NOT NULL THEN 1.0 ELSE 0.0 END
          ) * 100, 2) as read_rate
        FROM notifications
        WHERE sent_at >= CURRENT_DATE - INTERVAL '30 days'
      `);

      return result.rows[0];
    }
  }

  /**
   * Limpar notificações antigas
   * @param {number} daysOld - Número de dias para considerar como antigas
   * @returns {number} Número de notificações excluídas
   */
  static async cleanupOldNotifications(daysOld = 90) {
    const result = await query(`
      DELETE FROM notifications
      WHERE sent_at < CURRENT_DATE - INTERVAL '${daysOld} days'
        AND read_at IS NOT NULL
    `);

    return result.rowCount;
  }

  /**
   * Buscar notificações recentes para dashboard
   * @param {number} limit - Limite de resultados
   * @returns {Array} Lista de notificações recentes
   */
  static async getRecentNotifications(limit = 20) {
    const result = await query(`
      SELECT 
        n.id, n.type, n.message, n.sent_at, n.read_at,
        u.name as user_name,
        e.title as event_title, e.date as event_date
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      LEFT JOIN events e ON n.event_id = e.id
      ORDER BY n.sent_at DESC
      LIMIT $1
    `, [limit]);

    return result.rows;
  }

  /**
   * Criar notificação para novo evento
   * @param {number} eventId - ID do evento
   * @param {string} eventTitle - Título do evento
   * @param {Array} userIds - IDs dos usuários para notificar (opcional, se não fornecido notifica todos)
   * @returns {Array} Notificações criadas
   */
  static async createNewEventNotifications(eventId, eventTitle, userIds = null) {
    let users;
    
    if (userIds && userIds.length > 0) {
      // Notificar usuários específicos
      const placeholders = userIds.map((_, index) => `$${index + 1}`).join(',');
      const result = await query(`
        SELECT id, name, email FROM users 
        WHERE id IN (${placeholders}) AND is_active = true
      `, userIds);
      users = result.rows;
    } else {
      // Notificar todos os usuários ativos
      const result = await query(`
        SELECT id, name, email FROM users 
        WHERE is_active = true
        ORDER BY name
      `);
      users = result.rows;
    }

    const notifications = users.map(user => ({
      user_id: user.id,
      event_id: eventId,
      type: 'new_event',
      message: `Novo evento criado: ${eventTitle}`
    }));

    return await this.createBatch(notifications);
  }

  /**
   * Criar notificações de lembrete
   * @param {number} eventId - ID do evento
   * @param {string} eventTitle - Título do evento
   * @param {string} reminderType - Tipo do lembrete ('daily' ou 'hourly')
   * @returns {Array} Notificações criadas
   */
  static async createReminderNotifications(eventId, eventTitle, reminderType) {
    let users;
    let message;

    if (reminderType === 'daily') {
      users = await this.getUsersForDailyReminder(eventId);
      message = `Lembrete: ${eventTitle} acontece amanhã!`;
    } else if (reminderType === 'hourly') {
      users = await this.getUsersForHourlyReminder(eventId);
      message = `Lembrete: ${eventTitle} acontece em 1 hora!`;
    } else {
      throw new Error('Tipo de lembrete inválido');
    }

    const notifications = users.map(user => ({
      user_id: user.id,
      event_id: eventId,
      type: 'event_reminder',
      message
    }));

    return await this.createBatch(notifications);
  }
}

module.exports = NotificationRepository;
module.exports = {};