import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { Church, Eye, EyeOff, AlertCircle } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Card Principal */}
        <div className="bg-white rounded-2xl p-10 border border-gray-100" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
          {/* Header do Card */}
          <div className="text-center mb-8">
            {/* Logo JIBCA */}
            <div className="w-14 h-14 mx-auto mb-6 rounded-xl flex items-center justify-center"
                 style={{ backgroundColor: 'rgba(139,0,0,0.1)' }}>
              <Church className="w-8 h-8" style={{ color: '#8B0000' }} />
            </div>
            
            {/* Títulos */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ letterSpacing: '-0.5px' }}>
              Agenda JIBCA
            </h1>
            <p className="text-gray-600 text-lg mb-3">
              Calendário da Juventude
            </p>
            
            {/* Separador */}
            <div className="border-t border-gray-100 pt-3 mt-3">
              <p className="text-gray-500 text-sm">
                Acesso restrito a membros autorizados
              </p>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Erro geral */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium">{errors.general}</span>
              </div>
            )}

            {/* Campo Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço de Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu-email@exemplo.com"
                className="w-full h-12 px-4 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none"
                style={{
                  fontSize: '15px',
                  borderWidth: '1.5px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8B0000'
                  e.target.style.boxShadow = '0 0 0 3px rgba(139,0,0,0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
                disabled={isLoading}
                required
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha de Acesso
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full h-12 px-4 pr-12 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none"
                  style={{
                    fontSize: '15px',
                    borderWidth: '1.5px'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#8B0000'
                    e.target.style.boxShadow = '0 0 0 3px rgba(139,0,0,0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.style.boxShadow = 'none'
                  }}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password}</span>
                </p>
              )}
              
              {/* Link Esqueceu Senha */}
              <div className="text-right mt-2">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium hover:underline transition-colors duration-200"
                  style={{ color: '#8B0000' }}
                >
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            {/* Botão de Login */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{
                  backgroundColor: '#8B0000',
                  letterSpacing: '0.3px'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.target.style.backgroundColor = '#A52A2A'
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) e.target.style.backgroundColor = '#8B0000'
                }}
                onMouseDown={(e) => {
                  if (!isLoading) e.target.style.backgroundColor = '#6B0000'
                }}
                onMouseUp={(e) => {
                  if (!isLoading) e.target.style.backgroundColor = '#A52A2A'
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner size="small" />
                    <span>Acessando...</span>
                  </div>
                ) : (
                  'Acessar Sistema'
                )}
              </button>
            </div>
          </form>

          {/* Versículo Bíblico */}
          <div className="border-t border-gray-100 pt-6 mt-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                    <path d="M8 6h4v2H8V6zM8 10h4v2H8v-2z" />
                  </svg>
                </div>
              </div>
              <blockquote className="text-sm text-gray-600 italic mb-2">
                "Ninguém o despreze pelo fato de você ser jovem"
              </blockquote>
              <cite className="text-xs text-gray-500 font-medium">
                1 Timóteo 4:12
              </cite>
              <p className="text-xs text-gray-400 mt-2">
                Fundamento espiritual da JIBCA
              </p>
            </div>
          </div>

          {/* Footer do Card */}
          <div className="border-t border-gray-100 pt-6 mt-4">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} JIBCA - Juventude da Igreja Batista Castro Alves
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage