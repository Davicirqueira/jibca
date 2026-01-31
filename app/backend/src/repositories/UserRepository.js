const { query, transaction } = require('../config/database');

class UserRepository {
  /**
   * Criar novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Object} Usuário criado
   */
  static async create(userData) {
    const { name, email, password_hash, role = 'member', phone, avatar_url } = userData;
    
    const result = await query(`
      INSERT INTO users (name, email, password_hash, role, phone, avatar_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, role, phone, avatar_url, is_active, created_at, updated_at
    `, [name, email.toLowerCase(), password_hash, role, phone, avatar_url]);

    return result.rows[0];
  }

  /**
   * Buscar usuário por ID
   * @param {number} id - ID do usuário
   * @returns {Object|null} Usuário encontrado ou null
   */
  static async findById(id) {
    const result = await query(`
      SELECT id, name, email, role, phone, avatar_url, is_active, created_at, updated_at
      FROM users 
      WHERE id = $1
    `, [id]);

    return result.rows[0] || null;
  }

  /**
   * Buscar usuário por email
   * @param {string} email - Email do usuário
   * @returns {Object|null} Usuário encontrado ou null
   */
  static async findByEmail(email) {
    const result = await query(`
      SELECT id, name, email, password_hash, role, phone, avatar_url, is_active, created_at, updated_at
      FROM users 
      WHERE email = $1
    `, [email.toLowerCase()]);

    return result.rows[0] || null;
  }

  /**
   * Listar usuários com paginação e filtros
   * @param {Object} options - Opções de listagem
   * @returns {Object} Lista paginada de usuários
   */
  static async list(options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      role = null,
      is_active = null,
      sort_by = 'name',
      sort_order = 'ASC'
    } = options;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    // Filtro de busca por nome ou email
    if (search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Filtro por role
    if (role) {
      whereConditions.push(`role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    // Filtro por status ativo
    if (is_active !== null) {
      whereConditions.push(`is_active = $${paramIndex}`);
      params.push(is_active);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Validar campos de ordenação
    const validSortFields = ['name', 'email', 'role', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'name';
    const sortDirection = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Query principal
    const usersResult = await query(`
      SELECT id, name, email, role, phone, avatar_url, is_active, created_at, updated_at
      FROM users 
      ${whereClause}
      ORDER BY ${sortField} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    // Query para contar total
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM users 
      ${whereClause}
    `, params);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return {
      users: usersResult.rows,
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
   * Atualizar usuário
   * @param {number} id - ID do usuário
   * @param {Object} updateData - Dados para atualização
   * @returns {Object|null} Usuário atualizado ou null
   */
  static async update(id, updateData) {
    const allowedFields = ['name', 'email', 'phone', 'avatar_url', 'role'];
    const updates = [];
    const params = [];
    let paramIndex = 1;

    // Construir query dinâmica apenas com campos permitidos
    Object.keys(updateData).forEach(field => {
      if (allowedFields.includes(field) && updateData[field] !== undefined) {
        if (field === 'email') {
          updates.push(`${field} = $${paramIndex}`);
          params.push(updateData[field].toLowerCase());
        } else {
          updates.push(`${field} = $${paramIndex}`);
          params.push(updateData[field]);
        }
        paramIndex++;
      }
    });

    if (updates.length === 0) {
      throw new Error('Nenhum campo válido para atualização');
    }

    params.push(id);

    const result = await query(`
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, name, email, role, phone, avatar_url, is_active, created_at, updated_at
    `, params);

    return result.rows[0] || null;
  }

  /**
   * Desativar usuário (soft delete)
   * @param {number} id - ID do usuário
   * @returns {Object|null} Usuário desativado ou null
   */
  static async deactivate(id) {
    const result = await query(`
      UPDATE users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, email, role, phone, avatar_url, is_active, created_at, updated_at
    `, [id]);

    return result.rows[0] || null;
  }

  /**
   * Reativar usuário
   * @param {number} id - ID do usuário
   * @returns {Object|null} Usuário reativado ou null
   */
  static async reactivate(id) {
    const result = await query(`
      UPDATE users 
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, email, role, phone, avatar_url, is_active, created_at, updated_at
    `, [id]);

    return result.rows[0] || null;
  }

  /**
   * Verificar se email já existe
   * @param {string} email - Email para verificar
   * @param {number} excludeId - ID para excluir da verificação (para updates)
   * @returns {boolean} True se email já existe
   */
  static async emailExists(email, excludeId = null) {
    let query_text = 'SELECT id FROM users WHERE email = $1';
    let params = [email.toLowerCase()];

    if (excludeId) {
      query_text += ' AND id != $2';
      params.push(excludeId);
    }

    const result = await query(query_text, params);
    return result.rows.length > 0;
  }

  /**
   * Contar usuários por role
   * @returns {Object} Contadores por role
   */
  static async countByRole() {
    const result = await query(`
      SELECT 
        role,
        COUNT(*) as count,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
      FROM users 
      GROUP BY role
    `);

    const stats = {
      leader: { total: 0, active: 0 },
      member: { total: 0, active: 0 }
    };

    result.rows.forEach(row => {
      stats[row.role] = {
        total: parseInt(row.count),
        active: parseInt(row.active_count)
      };
    });

    return stats;
  }

  /**
   * Buscar usuários ativos para notificações
   * @returns {Array} Lista de usuários ativos
   */
  static async findActiveUsers() {
    const result = await query(`
      SELECT id, name, email, role
      FROM users 
      WHERE is_active = true
      ORDER BY name
    `);

    return result.rows;
  }

  /**
   * Atualizar senha do usuário
   * @param {number} id - ID do usuário
   * @param {string} password_hash - Hash da nova senha
   * @returns {boolean} True se atualizado com sucesso
   */
  static async updatePassword(id, password_hash) {
    const result = await query(`
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [password_hash, id]);

    return result.rowCount > 0;
  }
}

module.exports = UserRepository;