import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Verificar autenticação ao carregar a aplicação
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser()
          if (storedUser) {
            setUser(storedUser)
            setIsAuthenticated(true)
            
            // Verificar se o token ainda é válido
            try {
              const currentUser = await authService.getCurrentUser()
              setUser(currentUser)
            } catch (error) {
              // Token inválido, fazer logout
              await logout()
            }
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error)
        await logout()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Função de login
  const login = async (email, password) => {
    try {
      setLoading(true)
      const { user: userData, token } = await authService.login(email, password)
      
      setUser(userData)
      setIsAuthenticated(true)
      
      toast.success(`Bem-vindo(a), ${userData.name}!`)
      return userData
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Erro ao fazer login'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Função de logout
  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      toast.success('Logout realizado com sucesso')
    }
  }

  // Atualizar dados do usuário
  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('jibca_user', JSON.stringify(userData))
  }

  // Verificar se o usuário tem uma role específica
  const hasRole = (role) => {
    return user?.role === role
  }

  // Verificar se é líder
  const isLeader = () => {
    return hasRole('leader')
  }

  // Verificar se é membro
  const isMember = () => {
    return hasRole('member')
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    hasRole,
    isLeader,
    isMember,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}