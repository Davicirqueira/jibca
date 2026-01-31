const { validationResult } = require('express-validator');
const NotificationRepository = require('../repositories/NotificationRepository');
const NotificationService = require('../services/NotificationService');

class NotificationController {
  /**
   * Listar notificações do usuário
   * GET /api/v1/notifications
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
        unread_only = 'false',
        type = null
      } = req.query;

      const userId = req.user.id;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        unread_only: unread_only === 'true',
        type,
        include_event_details: true
      };

      const result = await NotificationRepository.listByUser(userId, options);

      // Também retornar contagem de não lidas
      const unreadCount = await NotificationRepository.countUnread(userId);

      res.json({
        success: true,
        data: {
          notifications: result.notifications,
          pagination: result.pagination,
          unread_count: unreadCount
        }
      });

    } catch (error) {
      console.error('Erro ao listar notificações:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'LIST_NOTIFICATIONS_ERROR',
          message: 'Erro interno ao listar notificações'
        }
      });
    }
  }

  /**
   * Marcar notificação como lida
   * PUT /api/v1/notifications/:id/read
   */
  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'ID da notificação deve ser um número válido'
          }
        });
      }

      const notificationId = parseInt(id);

      // Verificar se notificação existe e pertence ao usuário
      const notification = await NotificationRepository.findById(notificationId);
      if (!notification) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOTIFICATION_NOT_FOUND',
            message: 'Notificação não encontrada'
          }
        });
      }

      if (notification.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Você não tem permissão para acessar esta notificação'
          }
        });
      }

      // Marcar como lida
      const updatedNotification = await NotificationRepository.markAsRead(notificationId, userId);

      if (!updatedNotification) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_READ',
            message: 'Notificação já foi marcada como lida'
          }
        });
      }

      res.json({
        success: true,
        data: {
          notification: updatedNotification
        },
        message: 'Notificação marcada como lida'
      });

    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'MARK_READ_ERROR',
          message: 'Erro interno ao marcar notificação como lida'
        }
      });
    }
  }

  /**
   * Marcar todas as notificações como lidas
   * PUT /api/v1/notifications/read-all
   */
  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      const markedCount = await NotificationRepository.markAllAsRead(userId);

      res.json({
        success: true,
        data: {
          marked_count: markedCount
        },
        message: `${markedCount} notificações marcadas como lidas`
      });

    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'MARK_ALL_READ_ERROR',
          message: 'Erro interno ao marcar todas as notificações como lidas'
        }
      });
    }
  }

  /**
   * Obter contagem de notificações não lidas
   * GET /api/v1/notifications/unread-count
   */
  static async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;

      const unreadCount = await NotificationRepository.countUnread(userId);

      res.json({
        success: true,
        data: {
          unread_count: unreadCount
        }
      });

    } catch (error) {
      console.error('Erro ao buscar contagem de não lidas:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'UNREAD_COUNT_ERROR',
          message: 'Erro interno ao buscar contagem de não lidas'
        }
      });
    }
  }

  /**
   * Excluir notificação
   * DELETE /api/v1/notifications/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'ID da notificação deve ser um número válido'
          }
        });
      }

      const notificationId = parseInt(id);

      // Verificar se notificação existe e pertence ao usuário
      const notification = await NotificationRepository.findById(notificationId);
      if (!notification) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOTIFICATION_NOT_FOUND',
            message: 'Notificação não encontrada'
          }
        });
      }

      if (notification.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Você não tem permissão para excluir esta notificação'
          }
        });
      }

      const deleted = await NotificationRepository.delete(notificationId, userId);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'DELETE_FAILED',
            message: 'Falha ao excluir notificação'
          }
        });
      }

      res.json({
        success: true,
        message: 'Notificação excluída com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_NOTIFICATION_ERROR',
          message: 'Erro interno ao excluir notificação'
        }
      });
    }
  }

  /**
   * Obter estatísticas de notificações do usuário
   * GET /api/v1/notifications/my-stats
   */
  static async getMyStats(req, res) {
    try {
      const userId = req.user.id;

      const stats = await NotificationRepository.getStats(userId);

      res.json({
        success: true,
        data: {
          stats
        }
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas do usuário:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'USER_STATS_ERROR',
          message: 'Erro interno ao buscar suas estatísticas'
        }
      });
    }
  }

  /**
   * Obter estatísticas gerais do sistema (apenas Líder)
   * GET /api/v1/notifications/system-stats
   */
  static async getSystemStats(req, res) {
    try {
      const systemStats = await NotificationService.getSystemStats();

      res.json({
        success: true,
        data: systemStats
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas do sistema:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'SYSTEM_STATS_ERROR',
          message: 'Erro interno ao buscar estatísticas do sistema'
        }
      });
    }
  }

  /**
   * Enviar notificação personalizada (apenas Líder)
   * POST /api/v1/notifications/send
   */
  static async sendCustomNotification(req, res) {
    try {
      const { user_ids, message, type = 'custom', event_id = null } = req.body;

      // Validações básicas
      if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_USER_IDS',
            message: 'Lista de IDs de usuários deve ser fornecida'
          }
        });
      }

      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_MESSAGE',
            message: 'Mensagem não pode estar vazia'
          }
        });
      }

      if (message.length > 500) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MESSAGE_TOO_LONG',
            message: 'Mensagem deve ter no máximo 500 caracteres'
          }
        });
      }

      const notifications = await NotificationService.sendCustomNotification(
        user_ids,
        message.trim(),
        type,
        event_id
      );

      res.json({
        success: true,
        data: {
          notifications_sent: notifications.length,
          notifications
        },
        message: 'Notificações enviadas com sucesso'
      });

    } catch (error) {
      console.error('Erro ao enviar notificação personalizada:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'SEND_NOTIFICATION_ERROR',
          message: 'Erro interno ao enviar notificação'
        }
      });
    }
  }

  /**
   * Testar sistema de notificações (apenas desenvolvimento)
   * POST /api/v1/notifications/test
   */
  static async testSystem(req, res) {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'NOT_AVAILABLE_IN_PRODUCTION',
            message: 'Teste não disponível em produção'
          }
        });
      }

      await NotificationService.testNotificationSystem();

      res.json({
        success: true,
        message: 'Teste do sistema de notificações executado com sucesso'
      });

    } catch (error) {
      console.error('Erro no teste do sistema:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'TEST_SYSTEM_ERROR',
          message: 'Erro interno no teste do sistema'
        }
      });
    }
  }

  /**
   * Verificar saúde do sistema de notificações
   * GET /api/v1/notifications/health
   */
  static async getHealthStatus(req, res) {
    try {
      const healthStatus = NotificationService.getHealthStatus();

      res.json({
        success: true,
        data: {
          health: healthStatus,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Erro ao verificar saúde do sistema:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'HEALTH_CHECK_ERROR',
          message: 'Erro interno na verificação de saúde'
        }
      });
    }
  }
}

module.exports = NotificationController;