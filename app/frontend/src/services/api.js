import axios from 'axios'
import { toastManager } from '../utils/ToastManager'

// Configuração base do Axios
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jibca_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const { response } = error

    if (response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('jibca_token')
      localStorage.removeItem('jibca_user')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (response?.status === 403) {
      toastManager.error('Você não tem permissão para realizar esta ação')
      return Promise.reject(error)
    }

    if (response?.status >= 500) {
      toastManager.error('Erro interno do servidor. Tente novamente mais tarde.')
      return Promise.reject(error)
    }

    // Para outros erros, não mostrar toast aqui - deixar para o componente decidir
    // Isso evita toasts duplicados
    
    return Promise.reject(error)
  }
)

export default api