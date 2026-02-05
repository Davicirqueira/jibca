import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { authService } from '../services/authService'
import { toastManager } from '../utils/ToastManager'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  AlertCircle,
  Lock,
  Check,
  X
} from 'lucide-react'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [tokenData, setTokenData] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Validar token ao carregar
  useEffect(() => {
    validateToken()
  }, [token])

  const validateToken = async () => {
    if (!token) {
      toastManager.error('Token de recuperação não fornecido')
      navigate('/login')
      return
    }

    try {
      setLoading(true)
      const response = await authService.validateResetToken(token)
      
      if (response.success && response.data.valid) {
        setTokenValid(true)
        setTokenData(response.data)
      } else {
        toastManager.error('Token inválido ou expirado')
        navigate('/login')
      }
    } catch (error) {
      console.error('Erro ao validar token:', error)
      toastManager.error('Token inválido ou expirado')
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const validatePassword = (password) => {
    const errors = []
    
    if (password.length < 6) {
      errors.push('Mínimo 6 caracteres')
    }
    if (password.length > 50) {
      errors.push('Máximo 50 caracteres')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Letra minúscula')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Letra maiúscula')
    }
    if (!/\d/.test(password)) {
      errors.push('Número')
    }

    return errors
  }

  const getPasswordStrength = (password) => {
    const errors = validatePassword(password)
    if (errors.length === 0) return { level: 'strong', text: 'Forte', color: 'green' }
    if (errors.length <= 2) return { level: 'medium', text: 'Média', color: 'yellow' }
    return { level: 'weak', text: 'Fraca', color: 'red' }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Validação em tempo real
    if (touched[name]) {
      validateField(name, value)
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const validateField = (name, value) => {
    const newErrors = { ...errors }

    if (name === 'newPassword') {
      const passwordErrors = validatePassword(value)
      if (passwordErrors.length > 0) {
        newErrors.newPassword = `Senha deve conter: ${passwordErrors.join(', ')}`
      } else {
        delete newErrors.newPassword
      }

      // Revalidar confirmação se já foi tocada
      if (touched.confirmPassword && formData.confirmPassword) {
        if (value !== formData.confirmPassword) {
          newErrors.confirmPassword = 'As senhas não coincidem'
        } else {
          delete newErrors.confirmPassword
        }
      }
    }

    if (name === 'confirmPassword') {
      if (value !== formData.newPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem'
      } else {
        delete newErrors.confirmPassword
      }
    }

    setErrors(newErrors)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Marcar todos os campos como tocados
    setTouched({ newPassword: true, confirmPassword: true })

    // Validar todos os campos
    const newPasswordErrors = validatePassword(formData.newPassword)
    const newErrors = {}

    if (newPasswordErrors.length > 0) {
      newErrors.newPassword = `Senha deve conter: ${newPasswordErrors.join(', ')}`
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toastManager.error('Por favor, corrija os erros no formulário')
      return
    }

    try {
      setSubmitting(true)
      const response = await authService.resetPassword(
        token,
        formData.newPassword,
        formData.confirmPassword
      )

      if (response.success) {
        toastManager.success('Senha redefinida com sucesso! Faça login com sua nova senha.')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      
      if (error.response?.data?.error?.code === 'INVALID_TOKEN') {
        toastManager.error('Token inválido ou expirado')
        setTimeout(() => navigate('/login'), 2000)
      } else if (error.response?.data?.error?.message) {
        toastManager.error(error.response.data.error.message)
      } else {
        toastManager.error('Erro ao redefinir senha. Tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="text-white mt-4 font-medium">Validando token...</p>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return null
  }

  const passwordStrength = formData.newPassword ? getPasswordStrength(formData.newPassword) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Lock className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">
              Nova Senha
            </h1>
            <p className="text-blue-100 text-center text-sm">
              Defina uma senha forte para sua conta
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Info do Usuário */}
            {tokenData?.email && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-800 text-sm text-center">
                  Redefinindo senha para: <strong>{tokenData.email}</strong>
                </p>
              </div>
            )}

            {/* Nova Senha */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
                <Key className="w-4 h-4 text-blue-600" />
                <span>Nova Senha</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Digite sua nova senha"
                  className={`w-full px-4 py-3 pr-12 border rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.newPassword
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  disabled={submitting}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Força da Senha */}
              {formData.newPassword && passwordStrength && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Força da senha:</span>
                    <span className={`text-xs font-semibold text-${passwordStrength.color}-600`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${passwordStrength.color}-500 transition-all duration-300`}
                      style={{
                        width: passwordStrength.level === 'strong' ? '100%' : 
                               passwordStrength.level === 'medium' ? '66%' : '33%'
                      }}
                    />
                  </div>
                </div>
              )}

              {errors.newPassword && (
                <p className="text-red-600 text-sm font-medium flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.newPassword}</span>
                </p>
              )}

              {/* Requisitos da Senha */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                <p className="text-xs font-semibold text-gray-700 mb-2">A senha deve conter:</p>
                {[
                  { test: formData.newPassword.length >= 6, text: 'Mínimo 6 caracteres' },
                  { test: /[a-z]/.test(formData.newPassword), text: 'Letra minúscula' },
                  { test: /[A-Z]/.test(formData.newPassword), text: 'Letra maiúscula' },
                  { test: /\d/.test(formData.newPassword), text: 'Número' }
                ].map((req, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {req.test ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <X className="w-3 h-3 text-gray-400" />
                    )}
                    <span className={`text-xs ${req.test ? 'text-green-600' : 'text-gray-500'}`}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
                <Key className="w-4 h-4 text-blue-600" />
                <span>Confirmar Senha</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Digite novamente sua senha"
                  className={`w-full px-4 py-3 pr-12 border rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : formData.confirmPassword && formData.confirmPassword === formData.newPassword
                      ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {formData.confirmPassword && formData.confirmPassword === formData.newPassword && !errors.confirmPassword && (
                  <CheckCircle2 className="absolute right-12 top-3 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm font-medium flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              className="flex items-center justify-center space-x-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={submitting || Object.keys(errors).length > 0}
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Redefinindo...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Redefinir Senha</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Link de Voltar */}
        <div className="text-center mt-6">
          <Link to="/login" className="text-white text-sm hover:underline">
            Voltar para Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
