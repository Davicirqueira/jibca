import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/userService'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { 
  User,
  Mail,
  Phone,
  Shield,
  Edit3,
  Save,
  X,
  Camera,
  Settings,
  Bell,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

const ProfilePage = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const validateField = (name, value) => {
    const fieldErrors = {}

    switch (name) {
      case 'name':
        if (!value.trim()) {
          fieldErrors.name = 'Nome é obrigatório'
        } else if (value.trim().length < 2) {
          fieldErrors.name = 'Nome deve ter pelo menos 2 caracteres'
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim())) {
          fieldErrors.name = 'Nome deve conter apenas letras e espaços'
        }
        break

      case 'email':
        if (!value.trim()) {
          fieldErrors.email = 'Email é obrigatório'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          fieldErrors.email = 'Email deve ter um formato válido'
        }
        break

      case 'phone':
        if (value.trim() && !/^[\d\s\(\)\-\+]+$/.test(value.trim())) {
          fieldErrors.phone = 'Telefone deve conter apenas números e símbolos válidos'
        }
        break

      case 'newPassword':
        if (showPasswordChange && !value) {
          fieldErrors.newPassword = 'Nova senha é obrigatória'
        } else if (value && value.length < 6) {
          fieldErrors.newPassword = 'Senha deve ter pelo menos 6 caracteres'
        }
        break

      case 'confirmPassword':
        if (showPasswordChange && value !== formData.newPassword) {
          fieldErrors.confirmPassword = 'Senhas não coincidem'
        }
        break
    }

    return fieldErrors
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (touched[name]) {
      const fieldErrors = validateField(name, value)
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
    
    Object.keys(formData).forEach(field => {
      if (field !== 'currentPassword' && field !== 'newPassword' && field !== 'confirmPassword') {
        const fieldErrors = validateField(field, formData[field])
        Object.assign(allErrors, fieldErrors)
      }
    })

    if (showPasswordChange) {
      const passwordErrors = validateField('newPassword', formData.newPassword)
      const confirmErrors = validateField('confirmPassword', formData.confirmPassword)
      Object.assign(allErrors, passwordErrors, confirmErrors)
    }

    setErrors(allErrors)
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
    
    return Object.keys(allErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    try {
      setLoading(true)
      
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null
      }

      if (showPasswordChange && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      const updatedUser = await userService.updateProfile(updateData)
      
      // Atualizar contexto de autenticação
      updateUser(updatedUser)
      
      setIsEditing(false)
      setShowPasswordChange(false)
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
      
      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      
      if (error.response?.data?.message) {
        if (error.response.data.message.includes('senha atual')) {
          setErrors({ currentPassword: 'Senha atual incorreta' })
        } else if (error.response.data.message.includes('email')) {
          setErrors({ email: 'Este email já está em uso' })
        } else {
          toast.error(error.response.data.message)
        }
      } else {
        toast.error('Erro ao atualizar perfil')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setShowPasswordChange(false)
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setErrors({})
    setTouched({})
  }

  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName]
  }

  const isFieldValid = (fieldName) => {
    return touched[fieldName] && !errors[fieldName] && formData[fieldName]
  }

  const getRoleDisplayName = (role) => {
    return role === 'leader' ? 'Líder' : role === 'member' ? 'Membro' : role
  }

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  }

  return (
    <div className="space-y-8">
      {/* Header Corporativo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
            <p className="text-gray-600 font-medium">
              Gerencie suas informações pessoais e configurações
            </p>
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
            style={{ backgroundColor: '#8B0000' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#A52A2A'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#8B0000'}
          >
            <Edit3 className="w-4 h-4" />
            <span>Editar Perfil</span>
          </button>
        )}
      </div>

      {/* Card Principal do Perfil */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header do Card */}
        <div className="text-white p-8" style={{ background: 'linear-gradient(135deg, #8B0000 0%, #6B0000 100%)' }}>
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <span className="text-2xl font-bold text-white">
                  {getInitials(user?.name)}
                </span>
              </div>
              {isEditing && (
                <button className="absolute -bottom-2 -right-2 p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors duration-200">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Informações Básicas */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{user?.name}</h2>
              <p className="text-slate-200 text-lg font-medium mb-1">{user?.email}</p>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-slate-300" />
                <span className="text-slate-300 font-medium">
                  {getRoleDisplayName(user?.role)}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-slate-200 text-sm font-medium">Ativo</span>
              </div>
              <p className="text-slate-300 text-xs">
                Membro desde {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo do Card */}
        <div className="p-8">
          {isEditing ? (
            /* Modo de Edição */
            <div className="space-y-8">
              {/* Informações Pessoais */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Informações Pessoais</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome */}
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
                        className={`w-full px-4 py-3 border rounded-xl text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 ${
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
                        className={`w-full px-4 py-3 border rounded-xl text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 ${
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
                  <div className="space-y-2 md:col-span-2">
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
                        className={`w-full px-4 py-3 border rounded-xl text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 ${
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
              </div>

              {/* Alteração de Senha */}
              <div className="border-t border-gray-200 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-blue-600" />
                    <span>Segurança</span>
                  </h3>
                  <button
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                  >
                    {showPasswordChange ? 'Cancelar alteração' : 'Alterar senha'}
                  </button>
                </div>

                {showPasswordChange && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Senha Atual */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900">
                        Senha Atual
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {getFieldError('currentPassword') && (
                        <p className="text-red-600 text-sm font-medium">{errors.currentPassword}</p>
                      )}
                    </div>

                    {/* Nova Senha */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900">
                        Nova Senha
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`w-full px-4 py-3 pr-12 border rounded-xl text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 ${
                            getFieldError('newPassword')
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {getFieldError('newPassword') && (
                        <p className="text-red-600 text-sm font-medium">{errors.newPassword}</p>
                      )}
                    </div>

                    {/* Confirmar Senha */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 border rounded-xl text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 ${
                          getFieldError('confirmPassword')
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        disabled={loading}
                      />
                      {getFieldError('confirmPassword') && (
                        <p className="text-red-600 text-sm font-medium">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                  disabled={loading}
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>

                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ backgroundColor: '#8B0000' }}
                  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#A52A2A')}
                  onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#8B0000')}
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
                      <span>Salvar Alterações</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Modo de Visualização */
            <div className="space-y-8">
              {/* Informações Pessoais */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Informações Pessoais</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500">Nome Completo</span>
                    </div>
                    <p className="text-gray-900 font-medium">{user?.name}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500">Email</span>
                    </div>
                    <p className="text-gray-900 font-medium">{user?.email}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500">Telefone</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {user?.phone || 'Não informado'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Shield className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500">Função</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {getRoleDisplayName(user?.role)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Configurações Rápidas */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <span>Configurações</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Notificações</p>
                        <p className="text-sm text-gray-500">Receber lembretes de eventos</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Segurança</p>
                        <p className="text-sm text-gray-500">Última alteração de senha</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">Há 30 dias</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage