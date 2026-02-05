const { validationResult } = require('express-validator');
const UserRepository = require('../repositories/UserRepository');
const AuthService = require('../services/AuthService');

class ProfileController {
  /**
   * Buscar perfil do usuário logado
   * GET /api/v1/profile
   */
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;

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
            active: user.is_active,
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
          code: 'GET_PROFILE_ERROR',
          message: 'Erro interno ao buscar perfil'
        }
      });
    }
  }

  /**
   * Atualizar perfil do usuário logado
   * PUT /api/v1/profile
   */
  static async updateProfile(req, res) {
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

      const userId = req.user.id;
      const { name, phone } = req.body;

      // Validar que pelo menos um campo foi enviado
      if (!name && phone === undefined) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FIELDS_TO_UPDATE',
            message: 'Nenhum campo para atualizar'
          }
        });
      }

      // Preparar dados para atualização (sem email e role por segurança)
      const updateData = {};
      if (name) updateData.name = name.trim();
      if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;

      // Atualizar perfil
      const updatedUser = await UserRepository.update(userId, updateData);

      if (!updatedUser) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Falha ao atualizar perfil'
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
            active: updatedUser.is_active,
            is_active: updatedUser.is_active,
            created_at: updatedUser.created_at,
            updated_at: updatedUser.updated_at
          }
        },
        message: 'Perfil atualizado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_PROFILE_ERROR',
          message: 'Erro interno ao atualizar perfil',
          detail: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
  }

  /**
   * Atualizar senha do usuário logado
   * PUT /api/v1/profile/password
   */
  static async updatePassword(req, res) {
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

      const userId = req.user.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validar campos
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Todos os campos são obrigatórios'
          }
        });
      }

      // Validar senhas novas
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PASSWORDS_DONT_MATCH',
            message: 'Nova senha e confirmação não coincidem'
          }
        });
      }

      // Buscar usuário com senha
      const user = await UserRepository.findByEmail(req.user.email);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Usuário não encontrado'
          }
        });
      }

      // Validar senha atual
      const isPasswordCorrect = await AuthService.comparePassword(currentPassword, user.password_hash);
      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CURRENT_PASSWORD',
            message: 'Senha atual incorreta'
          }
        });
      }

      // Gerar hash da nova senha
      const newPasswordHash = await AuthService.hashPassword(newPassword);

      // Atualizar senha
      const updated = await UserRepository.updatePassword(userId, newPasswordHash);

      if (!updated) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Falha ao atualizar senha'
          }
        });
      }

      console.log(`✅ Senha atualizada para usuário ID: ${userId}`);

      res.json({
        success: true,
        message: 'Senha atualizada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar senha:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_PASSWORD_ERROR',
          message: 'Erro interno ao atualizar senha'
        }
      });
    }
  }
}

module.exports = ProfileController;
