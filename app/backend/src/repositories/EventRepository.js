const { query, transaction } = require('../config/database');

class EventRepository {
  /**
   * Criar novo evento
   * @param {Object} eventData - Dados do evento
   * @returns {Object} Evento criado
   */
  static async create(eventData) {
    const {
      title,
      description,
      event_type_id,
      date,
      time,
      location,
      duration_minutes,
      created_by
    } = eventData;

    const result = await query(`
      INSERT INTO events (title, description, event_type_id, date, time, location, duration_minutes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, title, description, event_type_id, date, time, location, duration_minutes, created_by, created_at, updated_at
    `, [title, description, event_type_id, date, time, location, duration_minutes, created_by]);

    return result.rows[0];
  }

  /**
   * Buscar evento por ID com informações completas
   * @param {number} id - ID do evento
   * @returns {Object|null} Evento encontrado ou null
   */
  static async findById(id) {
    const result = await query(`
      SELECT 
        e.id, e.title, e.description, e.date, e.time, e.location, e.duration_minutes,
        e.created_by, e.created_at, e.updated_at,
        et.name as event_type_name, et.color as event_type_color, et.icon as event_type_icon,
        u.name as created_by_name,
        COUNT(c.id) as total_confirmations,
        COUNT(CASE WHEN c.status = 'confirmed' THEN 1 END) as confirmed_count,
        COUNT(CASE WHEN c.status = 'declined' THEN 1 END) as declined_count,
        COUNT(CASE WHEN c.status = 'maybe' THEN 1 END) as maybe_count
      FROM events e
      LEFT JOIN event_types et ON e.event_type_id = et.id
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN confirmations c ON e.id = c.event_id
      WHERE e.id = $1
      GROUP BY e.id, et.id, u.id
    `, [id]);

    return result.rows[0] || null;
  }

  /**
   * Listar eventos com filtros e paginação
   * @param {Object} options - Opções de listagem
   * @returns {Object} Lista paginada de eventos
   */
  static async list(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        event_type_id = null,
        future_only = true,
        search = '',
        sort_by = 'date',
        sort_order = 'ASC',
        created_by = null
      } = options;

      const offset = (page - 1) * limit;
      let whereConditions = [];
      let params = [];
      let paramIndex = 1;

      // Filtro para eventos futuros
      if (future_only) {
        whereConditions.push(`e.date >= CURRENT_DATE`);
      }

      // Filtro por tipo de evento
      if (event_type_id) {
        whereConditions.push(`e.event_type_id = $${paramIndex}`);
        params.push(event_type_id);
        paramIndex++;
      }

      // Filtro por criador
      if (created_by) {
        whereConditions.push(`e.created_by = $${paramIndex}`);
        params.push(created_by);
        paramIndex++;
      }

      // Filtro de busca por título ou descrição
      if (search) {
        whereConditions.push(`(e.title ILIKE $${paramIndex} OR e.description ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      // Validar campos de ordenação
      const validSortFields = ['date', 'time', 'title', 'created_at'];
      const sortField = validSortFields.includes(sort_by) ? sort_by : 'date';
      const sortDirection = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      // Query principal
      const eventsResult = await query(`
        SELECT 
          e.id, e.title, e.description, e.date, e.time, e.location, e.duration_minutes,
          e.created_by, e.created_at, e.updated_at,
          et.name as event_type_name, et.color as event_type_color, et.icon as event_type_icon,
          u.name as created_by_name,
          COUNT(c.id) as total_confirmations,
          COUNT(CASE WHEN c.status = 'confirmed' THEN 1 END) as confirmed_count,
          COUNT(CASE WHEN c.status = 'declined' THEN 1 END) as declined_count,
          COUNT(CASE WHEN c.status = 'maybe' THEN 1 END) as maybe_count
        FROM events e
        LEFT JOIN event_types et ON e.event_type_id = et.id
        LEFT JOIN users u ON e.created_by = u.id
        LEFT JOIN confirmations c ON e.id = c.event_id
        ${whereClause}
        GROUP BY e.id, et.id, u.id
        ORDER BY e.${sortField} ${sortDirection}, e.time ${sortDirection}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, [...params, limit, offset]);

      // Query para contar total
      const countResult = await query(`
        SELECT COUNT(DISTINCT e.id) as total
        FROM events e
        LEFT JOIN event_types et ON e.event_type_id = et.id
        ${whereClause}
      `, params);

      const total = parseInt(countResult.rows[0]?.total || 0);
      const totalPages = Math.ceil(total / limit);

      // CRÍTICO: Sempre retornar array, mesmo vazio
      return {
        events: eventsResult.rows || [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Erro no repository ao buscar eventos:', error);
      // CRÍTICO: Em caso de erro, retornar array vazio ao invés de throw
      return {
        events: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }
  }

  /**
   * Buscar eventos para calendário mensal
   * @param {number} year - Ano
   * @param {number} month - Mês (1-12)
   * @returns {Array} Lista de eventos do mês
   */
  static async getCalendarEvents(year, month) {
    const result = await query(`
      SELECT 
        e.id, e.title, e.date, e.time, e.location,
        et.name as event_type_name, et.color as event_type_color, et.icon as event_type_icon,
        COUNT(CASE WHEN c.status = 'confirmed' THEN 1 END) as confirmed_count
      FROM events e
      LEFT JOIN event_types et ON e.event_type_id = et.id
      LEFT JOIN confirmations c ON e.id = c.event_id
      WHERE EXTRACT(YEAR FROM e.date) = $1 
        AND EXTRACT(MONTH FROM e.date) = $2
      GROUP BY e.id, et.id
      ORDER BY e.date, e.time
    `, [year, month]);

    return result.rows || [];
  }

  /**
   * Atualizar evento
   * @param {number} id - ID do evento
   * @param {Object} updateData - Dados para atualização
   * @returns {Object|null} Evento atualizado ou null
   */
  static async update(id, updateData) {
    const allowedFields = ['title', 'description', 'event_type_id', 'date', 'time', 'location', 'duration_minutes'];
    const updates = [];
    const params = [];
    let paramIndex = 1;

    // Construir query dinâmica apenas com campos permitidos
    Object.keys(updateData).forEach(field => {
      if (allowedFields.includes(field) && updateData[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        params.push(updateData[field]);
        paramIndex++;
      }
    });

    if (updates.length === 0) {
      throw new Error('Nenhum campo válido para atualização');
    }

    params.push(id);

    const result = await query(`
      UPDATE events 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, title, description, event_type_id, date, time, location, duration_minutes, created_by, created_at, updated_at
    `, params);

    return result.rows[0] || null;
  }

  /**
   * Excluir evento (com cascade para confirmações)
   * @param {number} id - ID do evento
   * @returns {boolean} True se excluído com sucesso
   */
  static async delete(id) {
    return await transaction(async (client) => {
      // As confirmações serão excluídas automaticamente devido ao CASCADE
      // As notificações também serão excluídas automaticamente devido ao CASCADE
      
      const result = await client.query('DELETE FROM events WHERE id = $1', [id]);
      return result.rowCount > 0;
    });
  }

  /**
   * Buscar tipos de evento disponíveis
   * @returns {Array} Lista de tipos de evento
   */
  static async getEventTypes() {
    const result = await query(`
      SELECT id, name, color, icon, created_at
      FROM event_types
      ORDER BY name
    `);

    return result.rows || [];
  }

  /**
   * Buscar eventos próximos (para notificações)
   * @param {string} timeframe - '24h' ou '1h'
   * @returns {Array} Lista de eventos próximos
   */
  static async getUpcomingEvents(timeframe) {
    let timeCondition;
    
    if (timeframe === '24h') {
      timeCondition = `
        e.date = CURRENT_DATE + INTERVAL '1 day'
        OR (e.date = CURRENT_DATE AND e.time > CURRENT_TIME)
      `;
    } else if (timeframe === '1h') {
      timeCondition = `
        (e.date = CURRENT_DATE AND e.time BETWEEN CURRENT_TIME AND CURRENT_TIME + INTERVAL '1 hour')
        OR (e.date = CURRENT_DATE + INTERVAL '1 day' AND e.time <= CURRENT_TIME + INTERVAL '1 hour' - INTERVAL '1 day')
      `;
    } else {
      throw new Error('Timeframe deve ser "24h" ou "1h"');
    }

    const result = await query(`
      SELECT 
        e.id, e.title, e.description, e.date, e.time, e.location,
        et.name as event_type_name
      FROM events e
      LEFT JOIN event_types et ON e.event_type_id = et.id
      WHERE ${timeCondition}
      ORDER BY e.date, e.time
    `);

    return result.rows || [];
  }

  /**
   * Contar eventos por status
   * @returns {Object} Estatísticas de eventos
   */
  static async getEventStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN date >= CURRENT_DATE THEN 1 END) as future_events,
        COUNT(CASE WHEN date < CURRENT_DATE THEN 1 END) as past_events,
        et.name as event_type,
        COUNT(CASE WHEN et.id IS NOT NULL THEN 1 END) as count_by_type
      FROM events e
      LEFT JOIN event_types et ON e.event_type_id = et.id
      GROUP BY et.id, et.name
    `);

    const totalResult = await query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN date >= CURRENT_DATE THEN 1 END) as future_events,
        COUNT(CASE WHEN date < CURRENT_DATE THEN 1 END) as past_events
      FROM events
    `);

    return {
      total: totalResult.rows[0],
      by_type: result.rows
    };
  }

  /**
   * Verificar se usuário pode editar evento
   * @param {number} eventId - ID do evento
   * @param {number} userId - ID do usuário
   * @param {string} userRole - Role do usuário
   * @returns {boolean} True se pode editar
   */
  static async canUserEditEvent(eventId, userId, userRole) {
    // Líderes podem editar qualquer evento
    if (userRole === 'leader') {
      return true;
    }

    // Membros só podem editar eventos que criaram (se implementarmos essa funcionalidade)
    const result = await query(
      'SELECT created_by FROM events WHERE id = $1',
      [eventId]
    );

    if (result.rows.length === 0) {
      return false;
    }

    return result.rows[0].created_by === userId;
  }

  /**
   * Buscar eventos criados por um usuário
   * @param {number} userId - ID do usuário
   * @param {Object} options - Opções de listagem
   * @returns {Array} Lista de eventos do usuário
   */
  static async findByCreator(userId, options = {}) {
    const { future_only = false, limit = null } = options;
    
    let whereClause = 'WHERE e.created_by = $1';
    let params = [userId];
    
    if (future_only) {
      whereClause += ' AND e.date >= CURRENT_DATE';
    }
    
    let limitClause = '';
    if (limit) {
      limitClause = `LIMIT $${params.length + 1}`;
      params.push(limit);
    }

    const result = await query(`
      SELECT 
        e.id, e.title, e.description, e.date, e.time, e.location, e.duration_minutes,
        e.created_at, e.updated_at,
        et.name as event_type_name, et.color as event_type_color,
        COUNT(c.id) as total_confirmations
      FROM events e
      LEFT JOIN event_types et ON e.event_type_id = et.id
      LEFT JOIN confirmations c ON e.id = c.event_id
      ${whereClause}
      GROUP BY e.id, et.id
      ORDER BY e.date DESC, e.time DESC
      ${limitClause}
    `, params);

    return result.rows || [];
  }

  /**
   * Contar eventos futuros
   * @returns {number} Número de eventos futuros
   */
  static async countUpcomingEvents() {
    const result = await query(`
      SELECT COUNT(*) as count
      FROM events
      WHERE date >= CURRENT_DATE
    `);
    return parseInt(result.rows[0]?.count || 0);
  }

  /**
   * Contar eventos criados por um usuário
   * @param {number} userId - ID do usuário
   * @returns {number} Número de eventos criados
   */
  static async countByCreator(userId) {
    const result = await query(`
      SELECT COUNT(*) as count
      FROM events
      WHERE created_by = $1
    `, [userId]);
    return parseInt(result.rows[0]?.count || 0);
  }
}

module.exports = EventRepository;
