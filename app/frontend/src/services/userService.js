import api from './api'

export const userService = {
  // Listar usuários/membros (apenas líder)
  async getUsers(params = {}) {
    try {
      // Mapear parâmetros do frontend para backend
      const backendParams = {
        ...params,
        // Mapear 'status' para 'is_active' se necessário
        is_active: params.status === 'active' ? true : 
                  params.status === 'inactive' ? false : 
                  params.is_active
      };
      
      // Remover parâmetro 'status' se foi mapeado
      if (params.status) {
        delete backendParams.status;
      }
      
      const response = await api.get('/users', { params: backendParams })
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  // Obter usuário por ID
  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`)
      return response.data.data.user
    } catch (error) {
      throw error
    }
  },

  // Criar novo usuário/membro (apenas líder)
  async createUser(userData) {
    try {
      const response = await api.post('/users', userData)
      return response.data.data.user
    } catch (error) {
      throw error
    }
  },

  // Atualizar usuário (apenas líder)
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData)
      return response.data.data.user
    } catch (error) {
      throw error
    }
  },

  // Desativar usuário (apenas líder)
  async deactivateUser(id) {
    try {
      await api.delete(`/users/${id}`)
      return true
    } catch (error) {
      throw error
    }
  },

  // Reativar usuário (apenas líder)
  async reactivateUser(id) {
    try {
      const response = await api.patch(`/users/${id}/reactivate`)
      return response.data.data.user
    } catch (error) {
      throw error
    }
  },

  // Obter estatísticas de usuários (apenas líder)
  async getUserStats() {
    try {
      const response = await api.get('/users/stats')
      return response.data.data.stats
    } catch (error) {
      throw error
    }
  },

  // Atualizar perfil do usuário logado
  async updateProfile(userData) {
    try {
      const response = await api.put('/auth/profile', userData)
      return response.data.data.user
    } catch (error) {
      throw error
    }
  }
}