import api from './api'

export const eventService = {
  // Listar eventos
  async getEvents(params = {}) {
    try {
      const response = await api.get('/events', { params })
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  // Obter evento por ID
  async getEventById(id) {
    try {
      const response = await api.get(`/events/${id}`)
      return response.data.data.event
    } catch (error) {
      throw error
    }
  },

  // Criar novo evento (apenas líder)
  async createEvent(eventData) {
    try {
      const response = await api.post('/events', eventData)
      return response.data.data.event
    } catch (error) {
      throw error
    }
  },

  // Atualizar evento (apenas líder)
  async updateEvent(id, eventData) {
    try {
      const response = await api.put(`/events/${id}`, eventData)
      return response.data.data.event
    } catch (error) {
      throw error
    }
  },

  // Excluir evento (apenas líder)
  async deleteEvent(id) {
    try {
      await api.delete(`/events/${id}`)
      return true
    } catch (error) {
      throw error
    }
  },

  // Obter tipos de evento
  async getEventTypes() {
    try {
      const response = await api.get('/events/types')
      return response.data.data.event_types
    } catch (error) {
      throw error
    }
  },

  // Obter eventos para calendário
  async getCalendarEvents(month, year) {
    try {
      const response = await api.get('/events/calendar', {
        params: { month, year }
      })
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  // Obter estatísticas de eventos (apenas líder)
  async getEventStats() {
    try {
      const response = await api.get('/events/stats')
      return response.data.data.stats
    } catch (error) {
      throw error
    }
  }
}