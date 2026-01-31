const { validationResult } = require('express-validator');
const UserRepository = require('../repositories/UserRepository');
const AuthService = require('../services/AuthService');

class UserController {
  /**
   * Criar novo membro
   * POST /api/v1/users
   */
  static async create(req, res) {
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

      const { name, email, phone, password } = req.body;

      // Verificar se email já existe
      const emailExists = await UserRepository.emailExists(email);
      if (emailExists) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Este email já está cadastrado no sistema'
          }
        });
      }

      // Gerar hash da senha
      const password_hash = await AuthService.hashPassword(password);

      // Criar usuário
      const userData = {
        name: name.trim(),
        email: email.toLowerCase(),
        password_hash,
        role: 'member', // Sempre criar como membro
        phone: phone?.trim()
      };

      const newUser = await UserRepository.create(userData);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            phone: newUser.phone,
            is_active: newUser.is_active,
            created_at: newUser.created_at
          }
        },
        message: 'Membro criado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_USER_ERROR',
          message: 'Erro interno ao criar usuário'
        }
      });
    }
  }

  /**
   * Listar membros com paginação e filtros
   * GET /api/v1/users
   */
  static async list(req, res) {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Parâmetros inválidos',
            details: errors.array()
          }
        });
      }

      const {
        page = 1,
        limit = 20,
        search = '',
        role = null,
        is_active = null,
        sort_by = 'name',
        sort_order = 'ASC'
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        search: search.trim(),
        role,
        is_active: is_active !== null ? is_active === 'true' : null,
        sort_by,
        sort_order
      };

      const result = await UserRepository.list(options);

      res.json({
        success: true,
        data: {
          users: result.users,
          pagination: result.pagination
        }
      });

    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'LIST_USERS_ERROR',
          message: 'Erro interno ao listar usuários'
        }
      });
    }
  }

  /**
   * Buscar membro por ID
   * GET /api/v1/users/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'ID do usuário deve ser um número válido'
          }
        });
      }

      const user = await UserRepository.findById(parseInt(id));

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Usuário não encontrado'
          }
        });
      }

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
      console.error('Erro ao buscar usuário:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_USER_ERROR',
          message: 'Erro interno ao buscar usuário'
        }
      });
    }
  }

  /**
   * Atualizar membro
   * PUT /api/v1/users/:id
   */
  static async update(req, res) {
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

      const { id } = req.params;
      const updateData = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'ID do usuário deve ser um número válido'
          }
        });
      }

      const userId = parseInt(id);

      // Verificar se usuário existe
      const existingUser = await UserRepository.findById(userId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Usuário não encontrado'
          }
        });
      }

      // Verificar se email já existe (se está sendo alterado)
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await UserRepository.emailExists(updateData.email, userId);
        if (emailExists) {
          return res.status(409).json({
            success: false,
            error: {
              code: 'EMAIL_EXISTS',
              message: 'Este email já está cadastrado no sistema'
            }
          });
        }
      }

      // Limpar dados de entrada
      const cleanUpdateData = {};
      if (updateData.name) cleanUpdateData.name = updateData.name.trim();
      if (updateData.email) cleanUpdateData.email = updateData.email.toLowerCase();
      if (updateData.phone) cleanUpdateData.phone = updateData.phone.trim();

      const updatedUser = await UserRepository.update(userId, cleanUpdateData);

      res.json({
        success: true,
        data: {
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            avatar_url: updatedUser.avatar_url,
            is_active: updatedUser.is_active,
            created_at: updatedUser.created_at,
            updated_at: updatedUser.updated_at
          }
        },
        message: 'Usuário atualizado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_USER_ERROR',
          message: 'Erro interno ao atualizar usuário'
        }
      });
    }
  }

  /**
   * Desativar membro
   * DELETE /api/v1/users/:id
   */
  static async deactivate(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'ID do usuário deve ser um número válido'
          }
        });
      }

      const userId = parseInt(id);

      // Verificar se usuário existe
      const existingUser = await UserRepository.findById(userId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Usuário não encontrado'
          }
        });
      }

      // Não permitir desativar o próprio usuário
      if (userId === req.user.id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CANNOT_DEACTIVATE_SELF',
            message: 'Você não pode desativar sua própria conta'
          }
        });
      }

      // Não permitir desativar outros líderes
      if (existingUser.role === 'leader') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CANNOT_DEACTIVATE_LEADER',
            message: 'Não é possível desativar outros líderes'
          }
        });
      }

      const deactivatedUser = await UserRepository.deactivate(userId);

      res.json({
        success: true,
        data: {
          user: {
            id: deactivatedUser.id,
            name: deactivatedUser.name,
            email: deactivatedUser.email,
            role: deactivatedUser.role,
            is_active: deactivatedUser.is_active,
            updated_at: deactivatedUser.updated_at
          }
        },
        message: 'Usuário desativado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'DEACTIVATE_USER_ERROR',
          message: 'Erro interno ao desativar usuário'
        }
      });
    }
  }

  /**
   * Obter estatísticas de usuários
   * GET /api/v1/users/stats
   */
  static async getStats(req, res) {
    try {
      const stats = await UserRepository.countByRole();

      res.json({
        success: true,
        data: {
          stats: {
            total: stats.leader.total + stats.member.total,
            active: stats.leader.active + stats.member.active,
            by_role: stats
          }
        }
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'STATS_ERROR',
          message: 'Erro interno ao buscar estatísticas'
        }
      });
    }
  }
}

module.exports = UserController;