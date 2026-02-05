import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../services/authService'
import { toastManager } from '../utils/ToastManager'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  Mail, 
  ArrowLeft, 
  Send, 
  CheckCircle2,
  AlertCircle,
  Key
} from 'lucide-react'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validação
    if (!email.trim()) {
      setError('Email é obrigatório')
      return
    }

    if (!validateEmail(email)) {
      setError('Email inválido')
      return
    }

    try {
      setLoading(true)
      const response = await authService.forgotPassword(email)
      
      setSubmitted(true)
      
      // Em desenvolvimento, mostrar o token
      if (response.data?.token) {
        console.log('🔑 Token de recuperação (DEV):', response.data.token)
        console.log('🔗 URL de recuperação (DEV):', response.data.resetUrl)
      }

    } catch (error) {
      console.error('Erro ao solicitar recuperação:', error)
      
      // Por segurança, sempre mostrar mensagem genérica
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Card de Sucesso */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Ícone de Sucesso */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Título */}
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Email Enviado!
            </h1>

            {/* Mensagem */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-800 text-sm text-center">
                Se o email <strong>{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha.
              </p>
            </div>

            {/* Instruções */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">1</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Verifique sua caixa de entrada
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">2</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Clique no link de recuperação (válido por 1 hora)
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">3</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Defina sua nova senha
                </p>
              </div>
            </div>

            {/* Aviso */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6">
              <p className="text-yellow-800 text-xs text-center">
                Não recebeu o email? Verifique sua pasta de spam ou tente novamente em alguns minutos.
              </p>
            </div>

            {/* Botão Voltar */}
            <Link
              to="/login"
              className="flex items-center justify-center space-x-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para Login</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Key className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">
              Esqueceu sua senha?
            </h1>
            <p className="text-blue-100 text-center text-sm">
              Não se preocupe! Vamos te ajudar a recuperar o acesso.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Instruções */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-800 text-sm text-center">
                Digite seu email cadastrado e enviaremos um link para redefinir sua senha.
              </p>
            </div>

            {/* Campo de Email */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Email</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  placeholder="seu@email.com"
                  className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 ${
                    error
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  disabled={loading}
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm font-medium flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </p>
              )}
            </div>

            {/* Botões */}
            <div className="space-y-3">
              <button
                type="submit"
                className="flex items-center justify-center space-x-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Link de Recuperação</span>
                  </>
                )}
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center space-x-2 w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para Login</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Link de Ajuda */}
        <div className="text-center mt-6">
          <p className="text-white text-sm">
            Precisa de ajuda?{' '}
            <a href="#" className="font-semibold hover:underline">
              Entre em contato com o líder
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
