import api from './api'

export const dashboardService = {
  // Obter métricas básicas do dashboard
  async getMetrics() {
    try {
      const response = await api.get('/dashboard/metrics')
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  // Obter estatísticas detalhadas do dashboard
  async getDetailedStats() {
    try {
      const response = await api.get('/dashboard/stats')
      return response.data.data
    } catch (error) {
      throw error
    }
  }
}