import api from './api'

export const authService = {
  // Login do usuário
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password })
      
      if (response.data.success) {
        const { user, token } = response.data.data
        
        // Salvar no localStorage
        localStorage.setItem('jibca_token', token)
        localStorage.setItem('jibca_user', JSON.stringify(user))
        
        return { user, token }
      }
      
      throw new Error('Resposta inválida do servidor')
    } catch (error) {
      throw error
    }
  },

  // Logout do usuário
  async logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Mesmo se der erro no servidor, limpar dados locais
      console.warn('Erro ao fazer logout no servidor:', error)
    } finally {
      localStorage.removeItem('jibca_token')
      localStorage.removeItem('jibca_user')
    }
  },

  // Obter dados do usuário atual
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me')
      
      if (response.data.success) {
        const user = response.data.data.user
        localStorage.setItem('jibca_user', JSON.stringify(user))
        return user
      }
      
      throw new Error('Erro ao obter dados do usuário')
    } catch (error) {
      throw error
    }
  },

  // Verificar se o usuário está autenticado
  isAuthenticated() {
    const token = localStorage.getItem('jibca_token')
    const user = localStorage.getItem('jibca_user')
    return !!(token && user)
  },

  // Obter usuário do localStorage
  getStoredUser() {
    try {
      const userStr = localStorage.getItem('jibca_user')
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Erro ao parsear usuário do localStorage:', error)
      return null
    }
  },

  // Obter token do localStorage
  getStoredToken() {
    return localStorage.getItem('jibca_token')
  }
}