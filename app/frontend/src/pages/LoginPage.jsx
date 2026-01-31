import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { Church, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const validateForm = () => {
    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Formato de email inválido'
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória'
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve conter pelo menos 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (error) {
      setErrors({
        general: error.response?.data?.error?.message || 'Falha na autenticação. Verifique suas credenciais.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header Corporativo */}
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Church className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            JIBCA Sistema
          </h2>
          <p className="text-gray-600 text-lg font-medium">
            Plataforma de Gestão da Juventude
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Acesso restrito a membros autorizados
          </p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Erro geral */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium">{errors.general}</span>
              </div>
            )}

            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="label">
                Endereço de Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input-field pl-10 ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="seu.email@exemplo.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className="label">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Botão de Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center py-4 text-lg font-semibold"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="small" className="mr-3" />
                  Autenticando...
                </>
              ) : (
                'Acessar Sistema'
              )}
            </button>
          </form>

          {/* Credenciais de Demonstração */}
          <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 mb-3">
              Credenciais de Demonstração:
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                <span className="font-medium">Administrador:</span>
                <span className="font-mono">chris@jibca.org</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                <span className="font-medium">Participante:</span>
                <span className="font-mono">joao@exemplo.com</span>
              </div>
              <div className="text-center mt-3 p-2 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-700">Senha padrão: jibca2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé Corporativo */}
        <div className="text-center text-sm text-gray-500">
          <p className="font-medium">© 2026 JIBCA - Juventude da Igreja Batista</p>
          <p className="mt-1">Sistema desenvolvido com excelência técnica</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage