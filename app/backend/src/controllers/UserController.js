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

      const { name, email, phone, password, role } = req.body;

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

      // Validar role se fornecido
      if (role && !['leader', 'member'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ROLE',
            message: 'Role deve ser "leader" ou "member"'
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
        role: role || 'member', // Usar role enviado ou 'member' como padrão
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
            active: newUser.is_active, // Mapear is_active para active
            is_active: newUser.is_active, // Manter compatibilidade
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

      // Mapear is_active para active para compatibilidade com frontend
      const usersWithActiveField = result.users.map(user => ({
        ...user,
        active: user.is_active
      }));

      res.json({
        success: true,
        data: {
          users: usersWithActiveField,
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
            active: user.is_active, // Mapear is_active para active
            is_active: user.is_active, // Manter compatibilidade
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
      if (updateData.email && updateData.email.toLowerCase() !== existingUser.email.toLowerCase()) {
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
      if (updateData.email) cleanUpdateData.email = updateData.email.toLowerCase().trim();
      if (updateData.phone !== undefined) cleanUpdateData.phone = updateData.phone ? updateData.phone.trim() : null;
      if (updateData.role && ['leader', 'member'].includes(updateData.role)) {
        cleanUpdateData.role = updateData.role;
      }

      // Verificar se há campos para atualizar
      if (Object.keys(cleanUpdateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FIELDS_TO_UPDATE',
            message: 'Nenhum campo válido para atualização'
          }
        });
      }

      const updatedUser = await UserRepository.update(userId, cleanUpdateData);

      if (!updatedUser) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Falha ao atualizar usuário'
          }
        });
      }

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
            active: updatedUser.is_active, // Mapear is_active para active
            is_active: updatedUser.is_active, // Manter compatibilidade
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
          message: 'Erro interno ao atualizar usuário',
          detail: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      const userId = parseInt(id);

      console.log('🔍 DEBUG - Desativação de membro iniciada:', {
        targetUserId: userId,
        requesterId: req.user.id,
        requesterRole: req.user.role,
        requesterName: req.user.name
      });

      // As validações de permissão já foram feitas no middleware requireLeaderForDeactivation
      // Aqui só precisamos executar a desativação

      console.log('🔄 Executando desativação...');
      const deactivatedUser = await UserRepository.deactivate(userId);

      if (!deactivatedUser) {
        console.log('❌ Falha na desativação - repository retornou null');
        return res.status(500).json({
          success: false,
          error: {
            code: 'DEACTIVATION_FAILED',
            message: 'Falha ao desativar usuário'
          }
        });
      }

      console.log('✅ Usuário desativado com sucesso:', {
        id: deactivatedUser.id,
        name: deactivatedUser.name,
        is_active: deactivatedUser.is_active,
        updated_at: deactivatedUser.updated_at
      });

      res.json({
        success: true,
        data: {
          user: {
            id: deactivatedUser.id,
            name: deactivatedUser.name,
            email: deactivatedUser.email,
            role: deactivatedUser.role,
            phone: deactivatedUser.phone,
            avatar_url: deactivatedUser.avatar_url,
            active: deactivatedUser.is_active, // Mapear is_active para active
            is_active: deactivatedUser.is_active, // Manter compatibilidade
            created_at: deactivatedUser.created_at,
            updated_at: deactivatedUser.updated_at
          }
        },
        message: 'Usuário desativado com sucesso'
      });

    } catch (error) {
      console.error('❌ Erro ao desativar usuário:', error);
      
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
   * Reativar membro
   * PATCH /api/v1/users/:id/reactivate
   */
  static async reactivate(req, res) {
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

      // Buscar usuário
      const user = await UserRepository.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Usuário não encontrado'
          }
        });
      }

      // Verificar se já está ativo
      if (user.is_active) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'USER_ALREADY_ACTIVE',
            message: 'Usuário já está ativo'
          }
        });
      }

      // Reativar usuário
      const reactivatedUser = await UserRepository.reactivate(userId);

      if (!reactivatedUser) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'REACTIVATION_FAILED',
            message: 'Falha ao reativar usuário'
          }
        });
      }

      console.log(`✅ Usuário reativado: ${reactivatedUser.email} (ID: ${userId})`);

      res.json({
        success: true,
        data: {
          user: {
            id: reactivatedUser.id,
            name: reactivatedUser.name,
            email: reactivatedUser.email,
            role: reactivatedUser.role,
            phone: reactivatedUser.phone,
            avatar_url: reactivatedUser.avatar_url,
            active: reactivatedUser.is_active,
            is_active: reactivatedUser.is_active,
            created_at: reactivatedUser.created_at,
            updated_at: reactivatedUser.updated_at
          }
        },
        message: 'Usuário reativado com sucesso'
      });

    } catch (error) {
      console.error('❌ Erro ao reativar usuário:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'REACTIVATE_USER_ERROR',
          message: 'Erro interno ao reativar usuário'
        }
      });
    }
  }

  /**
   * Excluir membro permanentemente
   * DELETE /api/v1/users/:id/permanent
   */
  static async permanentDelete(req, res) {
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
      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Usuário não encontrado'
          }
        });
      }

      // Verificar se não é o próprio usuário logado
      if (userId === req.user.id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CANNOT_DELETE_SELF',
            message: 'Você não pode excluir sua própria conta'
          }
        });
      }

      // Verificar se usuário tem eventos criados
      const EventRepository = require('../repositories/EventRepository');
      const hasEvents = await EventRepository.countByCreator(userId);
      if (hasEvents > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'USER_HAS_EVENTS',
            message: 'Não é possível excluir usuário que criou eventos. Desative-o ao invés disso.'
          }
        });
      }

      // Excluir permanentemente
      const deleted = await UserRepository.permanentDelete(userId);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'DELETE_FAILED',
            message: 'Falha ao excluir usuário'
          }
        });
      }

      console.log(`✅ Usuário excluído permanentemente: ${user.email} (ID: ${userId})`);

      res.json({
        success: true,
        message: 'Usuário excluído permanentemente'
      });

    } catch (error) {
      console.error('❌ Erro ao excluir usuário permanentemente:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'PERMANENT_DELETE_ERROR',
          message: 'Erro interno ao excluir usuário'
        }
      });
    }
  }

  /**
   * Alterar senha de usuário (apenas líderes)
   * PUT /api/v1/users/:id/change-password
   */
  static async changePassword(req, res) {
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
      const { newPassword, confirmPassword } = req.body;

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

      // Verificar se usuário existe
      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Usuário não encontrado'
          }
        });
      }

      // Verificar se usuário está ativo
      if (!user.is_active) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'USER_INACTIVE',
            message: 'Não é possível alterar senha de usuário desativado'
          }
        });
      }

      // Gerar hash da nova senha
      const password_hash = await AuthService.hashPassword(newPassword);

      // Atualizar senha no banco
      const updatedUser = await UserRepository.update(userId, { password_hash });

      if (!updatedUser) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Falha ao atualizar senha'
          }
        });
      }

      // Invalidar tokens de recuperação existentes (se houver)
      try {
        await AuthService.invalidateUserResetTokens(userId);
      } catch (error) {
        console.warn('Aviso: Não foi possível invalidar tokens de recuperação:', error.message);
      }

      console.log(`✅ Senha alterada pelo líder ${req.user.name} para usuário: ${user.name} (${user.email})`);

      // Enviar notificação para o usuário informando sobre a alteração
      const NotificationService = require('../services/NotificationService');
      try {
        await NotificationService.sendCustomNotification(
          [userId],
          `Sua senha foi alterada pelo líder ${req.user.name}. Faça login com a nova senha.`,
          'password_changed',
          null
        );
      } catch (error) {
        console.warn('Aviso: Não foi possível enviar notificação ao usuário:', error.message);
      }

      res.json({
        success: true,
        message: 'Senha alterada com sucesso',
        data: {
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email
          }
        }
      });

    } catch (error) {
      console.error('❌ Erro ao alterar senha:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'CHANGE_PASSWORD_ERROR',
          message: 'Erro interno ao alterar senha'
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