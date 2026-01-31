import api from './api'

export const confirmationService = {
  // Confirmar presença em evento
  async confirmPresence(eventId, status) {
    try {
      const response = await api.post(`/events/${eventId}/confirmations`, { status })
      return response.data.data.confirmation
    } catch (error) {
      throw error
    }
  },

  // Obter confirmações de um evento
  async getEventConfirmations(eventId) {
    try {
      const response = await api.get(`/events/${eventId}/confirmations`)
      return response.data.data.confirmations
    } catch (error) {
      throw error
    }
  },

  // Obter minha confirmação para um evento
  async getMyConfirmation(eventId) {
    try {
      const response = await api.get(`/events/${eventId}/confirmations/me`)
      return response.data.data.confirmation
    } catch (error) {
      throw error
    }
  },

  // Remover confirmação
  async removeConfirmation(eventId) {
    try {
      await api.delete(`/events/${eventId}/confirmations`)
      return true
    } catch (error) {
      throw error
    }
  }
}