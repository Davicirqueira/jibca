const { validationResult } = require('express-validator');
const ConfirmationRepository = require('../repositories/ConfirmationRepository');
const EventRepository = require('../repositories/EventRepository');

class ConfirmationController {
  /**
   * Criar ou atualizar confirmação de presença
   * POST /api/v1/events/:id/confirmations
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

      const { id: eventId } = req.params;
      const { status } = req.body;
      const userId = req.user.id;

      if (!eventId || isNaN(parseInt(eventId))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_EVENT_ID',
            message: 'ID do evento deve ser um número válido'
          }
        });
      }

      const eventIdInt = parseInt(eventId);

      // Verificar se evento existe
      const event = await EventRepository.findById(eventIdInt);
      if (!event) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Evento não encontrado'
          }
        });
      }

      // Verificar se evento não é no passado
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (eventDate < today) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'EVENT_IN_PAST',
            message: 'Não é possível confirmar presença em eventos passados'
          }
        });
      }

      // Criar ou atualizar confirmação
      const confirmationData = {
        event_id: eventIdInt,
        user_id: userId,
        status
      };

      const confirmation = await ConfirmationRepository.createOrUpdate(confirmationData);

      // Buscar confirmação completa para retorno
      const completeConfirmation = await ConfirmationRepository.findByEventAndUser(eventIdInt, userId);

      res.json({
        success: true,
        data: {
          confirmation: completeConfirmation
        },
        message: 'Confirmação registrada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao criar confirmação:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_CONFIRMATION_ERROR',
          message: 'Erro interno ao registrar confirmação'
        }
      });
    }
  }

  /**
   * Listar confirmações de um evento
   * GET /api/v1/events/:id/confirmations
   */
  static async getByEvent(req, res) {
    try {
      const { id: eventId } = req.params;
      const { status, include_details = 'true' } = req.query;

      if (!eventId || isNaN(parseInt(eventId))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_EVENT_ID',
            message: 'ID do evento deve ser um número válido'
          }
        });
      }

      const eventIdInt = parseInt(eventId);

      // Verificar se evento existe
      const event = await EventRepository.findById(eventIdInt);
      if (!event) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Evento não encontrado'
          }
        });
      }

      const options = {
        status: status || null,
        include_user_details: include_details === 'true'
      };

      const result = await ConfirmationRepository.listByEvent(eventIdInt, options);

      res.json({
        success: true,
        data: {
          confirmations: result.confirmations,
          stats: result.stats,
          event: {
            id: event.id,
            title: event.title,
            date: event.date,
            time: event.time
          }
        }
      });

    } catch (error) {
      console.error('Erro ao listar confirmações:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'LIST_CONFIRMATIONS_ERROR',
          message: 'Erro interno ao listar confirmações'
        }
      });
    }
  }

  /**
   * Buscar confirmação específica do usuário
   * GET /api/v1/events/:id/confirmations/me
   */
  static async getMyConfirmation(req, res) {
    try {
      const { id: eventId } = req.params;
      const userId = req.user.id;

      if (!eventId || isNaN(parseInt(eventId))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_EVENT_ID',
            message: 'ID do evento deve ser um número válido'
          }
        });
      }

      const eventIdInt = parseInt(eventId);

      // Verificar se evento existe
      const event = await EventRepository.findById(eventIdInt);
      if (!event) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Evento não encontrado'
          }
        });
      }

      const confirmation = await ConfirmationRepository.findByEventAndUser(eventIdInt, userId);

      res.json({
        success: true,
        data: {
          confirmation: confirmation || null,
          has_confirmed: !!confirmation
        }
      });

    } catch (error) {
      console.error('Erro ao buscar confirmação:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_CONFIRMATION_ERROR',
          message: 'Erro interno ao buscar confirmação'
        }
      });
    }
  }

  /**
   * Listar confirmações do usuário autenticado
   * GET /api/v1/confirmations/me
   */
  static async getMyConfirmations(req, res) {
    try {
      const { 
        status, 
        future_only = 'true', 
        limit = 50 
      } = req.query;

      const userId = req.user.id;

      const options = {
        status: status || null,
        future_only: future_only === 'true',
        limit: parseInt(limit),
        include_event_details: true
      };

      const confirmations = await ConfirmationRepository.listByUser(userId, options);

      res.json({
        success: true,
        data: {
          confirmations
        }
      });

    } catch (error) {
      console.error('Erro ao listar minhas confirmações:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'LIST_MY_CONFIRMATIONS_ERROR',
          message: 'Erro interno ao listar suas confirmações'
        }
      });
    }
  }

  /**
   * Excluir confirmação
   * DELETE /api/v1/events/:id/confirmations
   */
  static async delete(req, res) {
    try {
      const { id: eventId } = req.params;
      const userId = req.user.id;

      if (!eventId || isNaN(parseInt(eventId))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_EVENT_ID',
            message: 'ID do evento deve ser um número válido'
          }
        });
      }

      const eventIdInt = parseInt(eventId);

      // Verificar se evento existe
      const event = await EventRepository.findById(eventIdInt);
      if (!event) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Evento não encontrado'
          }
        });
      }

      // Verificar se confirmação existe
      const existingConfirmation = await ConfirmationRepository.findByEventAndUser(eventIdInt, userId);
      if (!existingConfirmation) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CONFIRMATION_NOT_FOUND',
            message: 'Confirmação não encontrada'
          }
        });
      }

      const deleted = await ConfirmationRepository.delete(eventIdInt, userId);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'DELETE_FAILED',
            message: 'Falha ao excluir confirmação'
          }
        });
      }

      res.json({
        success: true,
        message: 'Confirmação removida com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir confirmação:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_CONFIRMATION_ERROR',
          message: 'Erro interno ao excluir confirmação'
        }
      });
    }
  }

  /**
   * Obter estatísticas de confirmações (apenas Líder)
   * GET /api/v1/confirmations/stats
   */
  static async getStats(req, res) {
    try {
      const { event_id } = req.query;

      if (event_id) {
        // Estatísticas de um evento específico
        const eventIdInt = parseInt(event_id);
        
        if (isNaN(eventIdInt)) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_EVENT_ID',
              message: 'ID do evento deve ser um número válido'
            }
          });
        }

        const eventStats = await ConfirmationRepository.getEventStats(eventIdInt);
        
        res.json({
          success: true,
          data: {
            event_stats: eventStats
          }
        });
      } else {
        // Estatísticas gerais
        const generalStats = await ConfirmationRepository.getGeneralStats();
        const topEvents = await ConfirmationRepository.getTopConfirmedEvents(5);
        const recentConfirmations = await ConfirmationRepository.getRecentConfirmations(10);

        res.json({
          success: true,
          data: {
            general_stats: generalStats,
            top_confirmed_events: topEvents,
            recent_confirmations: recentConfirmations
          }
        });
      }

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

  /**
   * Obter estatísticas do usuário
   * GET /api/v1/confirmations/my-stats
   */
  static async getMyStats(req, res) {
    try {
      const userId = req.user.id;

      const userStats = await ConfirmationRepository.getUserStats(userId);

      res.json({
        success: true,
        data: {
          user_stats: userStats
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
}

module.exports = ConfirmationController;
module.exports = {};