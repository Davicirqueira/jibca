const { validationResult } = require('express-validator');
const EventRepository = require('../repositories/EventRepository');

class EventController {
  /**
   * Criar novo evento (apenas Líder)
   * POST /api/v1/events
   */
  static async create(req, res) {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Formatar erros por campo para melhor debugging
        const fieldErrors = errors.array().reduce((acc, err) => {
          acc[err.path] = err.msg;
          return acc;
        }, {});

        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados inválidos fornecidos',
            details: fieldErrors
          }
        });
      }

      const {
        title,
        description,
        event_type_id,
        date,
        time,
        location,
        duration_minutes
      } = req.body;

      // Verificar se a data não é no passado
      const eventDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (eventDate < today) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATE',
            message: 'Não é possível criar eventos em datas passadas'
          }
        });
      }

      // Verificar se o tipo de evento existe
      const eventTypes = await EventRepository.getEventTypes();
      const validType = eventTypes.find(type => type.id === event_type_id);
      
      if (!validType) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_EVENT_TYPE',
            message: 'Tipo de evento inválido'
          }
        });
      }

      // Verificar se usuário está autenticado e tem ID
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuário não autenticado'
          }
        });
      }

      const eventData = {
        title: title.trim(),
        description: description?.trim(),
        event_type_id,
        date,
        time,
        location: location?.trim(),
        duration_minutes: duration_minutes || 120, // Default 2 horas
        created_by: req.user.id
      };

      const newEvent = await EventRepository.create(eventData);

      // Buscar evento completo para retorno
      const completeEvent = await EventRepository.findById(newEvent.id);

      res.status(201).json({
        success: true,
        data: {
          event: completeEvent
        },
        message: 'Evento criado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao criar evento:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_EVENT_ERROR',
          message: 'Erro interno ao criar evento',
          detail: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
  }

  /**
   * Listar eventos com filtros
   * GET /api/v1/events
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
        type = null,
        future_only = 'true',
        search = '',
        sort_by = 'date',
        sort_order = 'ASC'
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        event_type_id: type ? parseInt(type) : null,
        future_only: future_only === 'true',
        search: search.trim(),
        sort_by,
        sort_order
      };

      const result = await EventRepository.list(options);

      res.json({
        success: true,
        data: {
          events: result.events,
          pagination: result.pagination
        }
      });

    } catch (error) {
      console.error('Erro ao listar eventos:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'LIST_EVENTS_ERROR',
          message: 'Erro interno ao listar eventos'
        }
      });
    }
  }

  /**
   * Buscar evento por ID
   * GET /api/v1/events/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'ID do evento deve ser um número válido'
          }
        });
      }

      const event = await EventRepository.findById(parseInt(id));

      if (!event) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Evento não encontrado'
          }
        });
      }

      res.json({
        success: true,
        data: {
          event
        }
      });

    } catch (error) {
      console.error('Erro ao buscar evento:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_EVENT_ERROR',
          message: 'Erro interno ao buscar evento'
        }
      });
    }
  }

  /**
   * Atualizar evento (apenas Líder)
   * PUT /api/v1/events/:id
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
            message: 'ID do evento deve ser um número válido'
          }
        });
      }

      const eventId = parseInt(id);

      // Verificar se evento existe
      const existingEvent = await EventRepository.findById(eventId);
      if (!existingEvent) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Evento não encontrado'
          }
        });
      }

      // Verificar se usuário pode editar o evento
      const canEdit = await EventRepository.canUserEditEvent(eventId, req.user.id, req.user.role);
      if (!canEdit) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'EDIT_PERMISSION_DENIED',
            message: 'Você não tem permissão para editar este evento'
          }
        });
      }

      // Verificar se a nova data não é no passado (se está sendo alterada)
      if (updateData.date) {
        const eventDate = new Date(updateData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (eventDate < today) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_DATE',
              message: 'Não é possível alterar evento para data passada'
            }
          });
        }
      }

      // Verificar se o tipo de evento existe (se está sendo alterado)
      if (updateData.event_type_id) {
        const eventTypes = await EventRepository.getEventTypes();
        const validType = eventTypes.find(type => type.id === updateData.event_type_id);
        
        if (!validType) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_EVENT_TYPE',
              message: 'Tipo de evento inválido'
            }
          });
        }
      }

      // Limpar dados de entrada
      const cleanUpdateData = {};
      if (updateData.title) cleanUpdateData.title = updateData.title.trim();
      if (updateData.description !== undefined) cleanUpdateData.description = updateData.description?.trim();
      if (updateData.event_type_id) cleanUpdateData.event_type_id = updateData.event_type_id;
      if (updateData.date) cleanUpdateData.date = updateData.date;
      if (updateData.time) cleanUpdateData.time = updateData.time;
      if (updateData.location !== undefined) cleanUpdateData.location = updateData.location?.trim();
      if (updateData.duration_minutes) cleanUpdateData.duration_minutes = updateData.duration_minutes;

      const updatedEvent = await EventRepository.update(eventId, cleanUpdateData);

      // Buscar evento completo para retorno
      const completeEvent = await EventRepository.findById(eventId);

      res.json({
        success: true,
        data: {
          event: completeEvent
        },
        message: 'Evento atualizado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_EVENT_ERROR',
          message: 'Erro interno ao atualizar evento'
        }
      });
    }
  }

  /**
   * Excluir evento (apenas Líder)
   * DELETE /api/v1/events/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'ID do evento deve ser um número válido'
          }
        });
      }

      const eventId = parseInt(id);

      // Verificar se evento existe
      const existingEvent = await EventRepository.findById(eventId);
      if (!existingEvent) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Evento não encontrado'
          }
        });
      }

      // Verificar se usuário pode excluir o evento
      const canEdit = await EventRepository.canUserEditEvent(eventId, req.user.id, req.user.role);
      if (!canEdit) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'DELETE_PERMISSION_DENIED',
            message: 'Você não tem permissão para excluir este evento'
          }
        });
      }

      const deleted = await EventRepository.delete(eventId);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'DELETE_FAILED',
            message: 'Falha ao excluir evento'
          }
        });
      }

      res.json({
        success: true,
        message: 'Evento excluído com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_EVENT_ERROR',
          message: 'Erro interno ao excluir evento'
        }
      });
    }
  }

  /**
   * Obter eventos para calendário
   * GET /api/v1/events/calendar
   */
  static async getCalendar(req, res) {
    try {
      const { month, year } = req.query;

      // Usar mês e ano atuais se não fornecidos
      const now = new Date();
      const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
      const targetYear = year ? parseInt(year) : now.getFullYear();

      // Validar mês e ano
      if (targetMonth < 1 || targetMonth > 12) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_MONTH',
            message: 'Mês deve ser entre 1 e 12'
          }
        });
      }

      if (targetYear < 2020 || targetYear > 2030) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_YEAR',
            message: 'Ano deve ser válido'
          }
        });
      }

      const events = await EventRepository.getCalendarEvents(targetYear, targetMonth);

      res.json({
        success: true,
        data: {
          events,
          month: targetMonth,
          year: targetYear
        }
      });

    } catch (error) {
      console.error('Erro ao buscar calendário:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'CALENDAR_ERROR',
          message: 'Erro interno ao buscar calendário'
        }
      });
    }
  }

  /**
   * Obter tipos de evento disponíveis
   * GET /api/v1/events/types
   */
  static async getEventTypes(req, res) {
    try {
      const eventTypes = await EventRepository.getEventTypes();

      res.json({
        success: true,
        data: {
          event_types: eventTypes
        }
      });

    } catch (error) {
      console.error('Erro ao buscar tipos de evento:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'EVENT_TYPES_ERROR',
          message: 'Erro interno ao buscar tipos de evento'
        }
      });
    }
  }

  /**
   * Obter estatísticas de eventos
   * GET /api/v1/events/stats
   */
  static async getStats(req, res) {
    try {
      const stats = await EventRepository.getEventStats();

      res.json({
        success: true,
        data: {
          stats
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

module.exports = EventController;