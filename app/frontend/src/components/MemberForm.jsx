import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '../services/userService'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'
import { toastManager } from '../utils/ToastManager'
import { 
  User,
  Mail,
  Phone,
  Shield,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
  Key,
  UserPlus
} from 'lucide-react'

const MemberForm = ({ memberId = null, onClose = null, onSuccess = null }) => {
  const { isLeader } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'member',
    password: '',
    active: true
  })

  // Verificar permissão de líder
  useEffect(() => {
    if (!isLeader()) {
      toastManager.error('Acesso negado: Apenas líderes podem gerenciar membros')
      if (onClose) {
        onClose()
      } else {
        navigate('/members')
      }
      return
    }
  }, [isLeader, navigate, onClose])

  // Carregar dados do membro para edição
  useEffect(() => {
    if (memberId) {
      loadMemberData()
    } else {
      // Gerar senha inicial para novo membro
      generateInitialPassword()
    }
  }, [memberId])

  const loadMemberData = async () => {
    try {
      setLoading(true)
      const member = await userService.getUserById(memberId)
      
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        role: member.role || 'member',
        password: '', // Não carregar senha existente
        active: member.active !== false && member.active !== 0
      })
    } catch (error) {
      console.error('Erro ao carregar membro:', error)
      toastManager.error('Erro ao carregar dados do membro')
    } finally {
      setLoading(false)
    }
  }

  const generateInitialPassword = () => {
    // Gerar senha segura de 8 caracteres
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let password = ''
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setGeneratedPassword(password)
    setFormData(prev => ({ ...prev, password }))
  }

  const validateField = (name, value) => {
    const fieldErrors = {}

    switch (name) {
      case 'name':
        if (!value.trim()) {
          fieldErrors.name = 'Nome é obrigatório'
        } else if (value.trim().length < 2) {
          fieldErrors.name = 'Nome deve ter pelo menos 2 caracteres'
        } else if (value.trim().length > 100) {
          fieldErrors.name = 'Nome deve ter no máximo 100 caracteres'
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim())) {
          fieldErrors.name = 'Nome deve conter apenas letras e espaços'
        }
        break

      case 'email':
        if (!value.trim()) {
          fieldErrors.email = 'Email é obrigatório'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          fieldErrors.email = 'Email deve ter um formato válido'
        } else if (value.trim().length > 255) {
          fieldErrors.email = 'Email deve ter no máximo 255 caracteres'
        }
        break

      case 'phone':
        if (value.trim() && !/^[\d\s\(\)\-\+]+$/.test(value.trim())) {
          fieldErrors.phone = 'Telefone deve conter apenas números e símbolos válidos'
        } else if (value.trim() && value.trim().length > 20) {
          fieldErrors.phone = 'Telefone deve ter no máximo 20 caracteres'
        }
        break

      case 'password':
        if (!memberId && !value) {
          fieldErrors.password = 'Senha é obrigatória para novos membros'
        } else if (value && value.length < 6) {
          fieldErrors.password = 'Senha deve ter pelo menos 6 caracteres'
        } else if (value && value.length > 50) {
          fieldErrors.password = 'Senha deve ter no máximo 50 caracteres'
        }
        break

      case 'role':
        if (!value) {
          fieldErrors.role = 'Função é obrigatória'
        } else if (!['member', 'leader'].includes(value)) {
          fieldErrors.role = 'Função deve ser "member" ou "leader"'
        }
        break
    }

    return fieldErrors
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))

    // Validação em tempo real
    if (touched[name] && name !== 'active') {
      const fieldErrors = validateField(name, newValue)
      setErrors(prev => ({
        ...prev,
        ...fieldErrors,
        [name]: fieldErrors[name] || undefined
      }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))

    const fieldErrors = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      ...fieldErrors
    }))
  }

  const validateForm = () => {
    const allErrors = {}
    
    // Validar todos os campos exceto active
    Object.keys(formData).forEach(field => {
      if (field !== 'active') {
        const fieldErrors = validateField(field, formData[field])
        Object.assign(allErrors, fieldErrors)
      }
    })

    setErrors(allErrors)
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
    
    return Object.keys(allErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toastManager.error('Por favor, corrija os erros no formulário')
      return
    }

    try {
      setLoading(true)
      
      const memberData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        role: formData.role
      }

      // Incluir senha apenas se fornecida
      if (formData.password) {
        memberData.password = formData.password
      }

      let result
      if (memberId) {
        // Atualizar dados do membro
        result = await userService.updateUser(memberId, memberData)
        
        // Verificar se o status ativo mudou e fazer chamada separada
        const currentMember = await userService.getUserById(memberId)
        const currentActive = currentMember.active !== false && currentMember.active !== 0
        
        if (currentActive !== formData.active) {
          if (formData.active) {
            // Reativar membro
            await userService.reactivateUser(memberId)
            toastManager.success('Membro atualizado e reativado com sucesso!')
          } else {
            // Desativar membro
            await userService.deactivateUser(memberId)
            toastManager.success('Membro atualizado e desativado com sucesso!')
          }
        } else {
          toastManager.success('Membro atualizado com sucesso!')
        }
      } else {
        result = await userService.createUser(memberData)
        toastManager.success(`Membro criado com sucesso! Senha inicial: ${generatedPassword}`)
      }

      if (onSuccess) {
        onSuccess(result)
      } else {
        navigate('/members')
      }
    } catch (error) {
      console.error('Erro ao salvar membro:', error)
      
      if (error.response?.data?.error?.message) {
        const errorMsg = error.response.data.error.message
        if (errorMsg.includes('email') || errorMsg.includes('Email')) {
          setErrors({ email: 'Este email já está em uso' })
          toastManager.error('Email já está em uso por outro membro')
        } else {
          toastManager.error(errorMsg)
        }
      } else if (error.response?.data?.message) {
        toastManager.error(error.response.data.message)
      } else {
        toastManager.error(memberId ? 'Erro ao atualizar membro' : 'Erro ao criar membro')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (onClose) {
      onClose()
    } else {
      navigate('/members')
    }
  }

  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName]
  }

  const isFieldValid = (fieldName) => {
    return touched[fieldName] && !errors[fieldName] && formData[fieldName]
  }

  if (loading && memberId) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header Corporativo */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              {memberId ? <User className="w-8 h-8 text-white" /> : <UserPlus className="w-8 h-8 text-white" />}
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {memberId ? 'Editar Membro' : 'Novo Membro'}
              </h1>
              <p className="text-slate-200 text-sm font-medium">
                Sistema de Gestão de Membros JIBCA
              </p>
            </div>
          </div>
          
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Nome Completo */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
            <User className="w-4 h-4 text-blue-600" />
            <span>Nome Completo</span>
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Digite o nome completo do membro"
              className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                getFieldError('name')
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : isFieldValid('name')
                  ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              disabled={loading}
            />
            {isFieldValid('name') && (
              <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500" />
            )}
            {getFieldError('name') && (
              <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-red-500" />
            )}
          </div>
          {getFieldError('name') && (
            <p className="text-red-600 text-sm font-medium flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        {/* Email e Telefone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>Email</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="email@exemplo.com"
                className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                  getFieldError('email')
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : isFieldValid('email')
                    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                disabled={loading}
              />
              {isFieldValid('email') && (
                <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500" />
              )}
              {getFieldError('email') && (
                <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-red-500" />
              )}
            </div>
            {getFieldError('email') && (
              <p className="text-red-600 text-sm font-medium flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>Telefone</span>
              <span className="text-gray-400 text-xs">(opcional)</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="(11) 99999-9999"
                className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                  getFieldError('phone')
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : isFieldValid('phone')
                    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                disabled={loading}
              />
              {isFieldValid('phone') && (
                <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500" />
              )}
              {getFieldError('phone') && (
                <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-red-500" />
              )}
            </div>
            {getFieldError('phone') && (
              <p className="text-red-600 text-sm font-medium flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Função e Senha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Função */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Função no Sistema</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-xl text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 ${
                  getFieldError('role')
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : isFieldValid('role')
                    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                disabled={loading}
              >
                <option value="member">Membro</option>
                <option value="leader">Líder</option>
              </select>
              {isFieldValid('role') && (
                <CheckCircle2 className="absolute right-8 top-3 w-5 h-5 text-green-500" />
              )}
              {getFieldError('role') && (
                <AlertCircle className="absolute right-8 top-3 w-5 h-5 text-red-500" />
              )}
            </div>
            {getFieldError('role') && (
              <p className="text-red-600 text-sm font-medium flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.role}</span>
              </p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
              <Key className="w-4 h-4 text-blue-600" />
              <span>{memberId ? 'Nova Senha' : 'Senha Inicial'}</span>
              {!memberId && <span className="text-red-500">*</span>}
              {memberId && <span className="text-gray-400 text-xs">(deixe vazio para manter atual)</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder={memberId ? 'Digite nova senha (opcional)' : 'Senha será gerada automaticamente'}
                className={`w-full px-4 py-3 pr-12 border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                  getFieldError('password')
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : isFieldValid('password')
                    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                disabled={loading}
                readOnly={!memberId && !formData.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {getFieldError('password') && (
              <p className="text-red-600 text-sm font-medium flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.password}</span>
              </p>
            )}
            {!memberId && generatedPassword && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm font-medium">
                  Senha gerada automaticamente: <code className="bg-blue-100 px-2 py-1 rounded font-mono">{generatedPassword}</code>
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  O membro deverá alterar esta senha no primeiro acesso
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status Ativo */}
        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              disabled={loading}
            />
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">Membro Ativo</span>
            </div>
          </label>
          <p className="text-gray-600 text-sm ml-8">
            Membros inativos não podem fazer login no sistema
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancelar</span>
          </button>

          <button
            type="submit"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{memberId ? 'Atualizar Membro' : 'Criar Membro'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MemberForm