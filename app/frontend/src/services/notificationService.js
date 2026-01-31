import api from './api'

export const notificationService = {
  // Listar notificações do usuário
  async getNotifications(params = {}) {
    try {
      const response = await api.get('/notifications', { params })
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  // Marcar notificação como lida
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`)
      return response.data.data.notification
    } catch (error) {
      throw error
    }
  },

  // Marcar todas as notificações como lidas
  async markAllAsRead() {
    try {
      await api.put('/notifications/read-all')
      return true
    } catch (error) {
      throw error
    }
  },

  // Obter contagem de notificações não lidas
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count')
      return response.data.data.count
    } catch (error) {
      throw error
    }
  },

  // Obter estatísticas de notificações
  async getNotificationStats() {
    try {
      const response = await api.get('/notifications/stats')
      return response.data.data.stats
    } catch (error) {
      throw error
    }
  }
}