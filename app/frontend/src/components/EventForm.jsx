import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { eventService } from '../services/eventService'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'
import { 
  Calendar,
  Clock,
  MapPin,
  FileText,
  Users,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react'

const EventForm = ({ eventId = null, onClose = null, onSuccess = null }) => {
  const { isLeader } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [eventTypes, setEventTypes] = useState([])
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    event_type_id: ''
  })

  // Verificar permissão de líder
  useEffect(() => {
    if (!isLeader()) {
      toast.error('Acesso negado: Apenas líderes podem gerenciar eventos')
      if (onClose) {
        onClose()
      } else {
        navigate('/events')
      }
      return
    }
  }, [isLeader, navigate, onClose])

  // Carregar tipos de evento
  useEffect(() => {
    loadEventTypes()
  }, [])

  // Carregar dados do evento para edição
  useEffect(() => {
    if (eventId) {
      loadEventData()
    }
  }, [eventId])

  const loadEventTypes = async () => {
    try {
      setLoadingTypes(true)
      const types = await eventService.getEventTypes()
      setEventTypes(types)
    } catch (error) {
      console.error('Erro ao carregar tipos de evento:', error)
      toast.error('Erro ao carregar tipos de evento')
    } finally {
      setLoadingTypes(false)
    }
  }

  const loadEventData = async () => {
    try {
      setLoading(true)
      const event = await eventService.getEventById(eventId)
      
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date || '',
        time: event.time || '',
        location: event.location || '',
        event_type_id: event.event_type_id || ''
      })
    } catch (error) {
      console.error('Erro ao carregar evento:', error)
      toast.error('Erro ao carregar dados do evento')
    } finally {
      setLoading(false)
    }
  }

  const validateField = (name, value) => {
    const fieldErrors = {}

    switch (name) {
      case 'title':
        if (!value.trim()) {
          fieldErrors.title = 'Título é obrigatório'
        } else if (value.trim().length < 3) {
          fieldErrors.title = 'Título deve ter pelo menos 3 caracteres'
        } else if (value.trim().length > 100) {
          fieldErrors.title = 'Título deve ter no máximo 100 caracteres'
        }
        break

      case 'description':
        if (!value.trim()) {
          fieldErrors.description = 'Descrição é obrigatória'
        } else if (value.trim().length < 10) {
          fieldErrors.description = 'Descrição deve ter pelo menos 10 caracteres'
        } else if (value.trim().length > 500) {
          fieldErrors.description = 'Descrição deve ter no máximo 500 caracteres'
        }
        break

      case 'date':
        if (!value) {
          fieldErrors.date = 'Data é obrigatória'
        } else {
          const selectedDate = new Date(value)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          if (selectedDate < today) {
            fieldErrors.date = 'Data não pode ser no passado'
          }
        }
        break

      case 'time':
        if (!value) {
          fieldErrors.time = 'Horário é obrigatório'
        } else {
          const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
          if (!timeRegex.test(value)) {
            fieldErrors.time = 'Formato de horário inválido (HH:MM)'
          }
        }
        break

      case 'location':
        if (!value.trim()) {
          fieldErrors.location = 'Local é obrigatório'
        } else if (value.trim().length < 3) {
          fieldErrors.location = 'Local deve ter pelo menos 3 caracteres'
        } else if (value.trim().length > 100) {
          fieldErrors.location = 'Local deve ter no máximo 100 caracteres'
        }
        break

      case 'event_type_id':
        if (!value) {
          fieldErrors.event_type_id = 'Tipo de evento é obrigatório'
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

    // Validação em tempo real
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
      const fieldErrors = validateField(field, formData[field])
      Object.assign(allErrors, fieldErrors)
    })

    setErrors(allErrors)
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
    
    return Object.keys(allErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    try {
      setLoading(true)
      
      const eventData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim()
      }

      let result
      if (eventId) {
        result = await eventService.updateEvent(eventId, eventData)
        toast.success('Evento atualizado com sucesso!')
      } else {
        result = await eventService.createEvent(eventData)
        toast.success('Evento criado com sucesso!')
      }

      if (onSuccess) {
        onSuccess(result)
      } else {
        navigate('/events')
      }
    } catch (error) {
      console.error('Erro ao salvar evento:', error)
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error(eventId ? 'Erro ao atualizar evento' : 'Erro ao criar evento')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (onClose) {
      onClose()
    } else {
      navigate('/events')
    }
  }

  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName]
  }

  const isFieldValid = (fieldName) => {
    return touched[fieldName] && !errors[fieldName] && formData[fieldName]
  }

  if (loadingTypes) {
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
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {eventId ? 'Editar Evento' : 'Criar Novo Evento'}
              </h1>
              <p className="text-slate-200 text-sm font-medium">
                Sistema de Gestão de Eventos JIBCA
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
        {/* Título do Evento */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Título do Evento</span>
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Digite o título do evento"
              className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                getFieldError('title')
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : isFieldValid('title')
                  ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              disabled={loading}
            />
            {isFieldValid('title') && (
              <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500" />
            )}
            {getFieldError('title') && (
              <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-red-500" />
            )}
          </div>
          {getFieldError('title') && (
            <p className="text-red-600 text-sm font-medium flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.title}</span>
            </p>
          )}
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Descrição</span>
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Descreva os detalhes do evento"
              rows={4}
              className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 resize-none ${
                getFieldError('description')
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : isFieldValid('description')
                  ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              disabled={loading}
            />
            {isFieldValid('description') && (
              <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500" />
            )}
            {getFieldError('description') && (
              <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-red-500" />
            )}
          </div>
          {getFieldError('description') && (
            <p className="text-red-600 text-sm font-medium flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.description}</span>
            </p>
          )}
        </div>

        {/* Data e Horário */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Data</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-xl text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 ${
                  getFieldError('date')
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : isFieldValid('date')
                    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                disabled={loading}
              />
              {isFieldValid('date') && (
                <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500" />
              )}
              {getFieldError('date') && (
                <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-red-500" />
              )}
            </div>
            {getFieldError('date') && (
              <p className="text-red-600 text-sm font-medium flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.date}</span>
              </p>
            )}
          </div>

          {/* Horário */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Horário</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-xl text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 ${
                  getFieldError('time')
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : isFieldValid('time')
                    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                disabled={loading}
              />
              {isFieldValid('time') && (
                <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500" />
              )}
              {getFieldError('time') && (
                <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-red-500" />
              )}
            </div>
            {getFieldError('time') && (
              <p className="text-red-600 text-sm font-medium flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.time}</span>
              </p>
            )}
          </div>
        </div>

        {/* Local e Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Local */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Local</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Local do evento"
                className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                  getFieldError('location')
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : isFieldValid('location')
                    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                disabled={loading}
              />
              {isFieldValid('location') && (
                <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500" />
              )}
              {getFieldError('location') && (
                <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-red-500" />
              )}
            </div>
            {getFieldError('location') && (
              <p className="text-red-600 text-sm font-medium flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.location}</span>
              </p>
            )}
          </div>

          {/* Tipo de Evento */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Tipo de Evento</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="event_type_id"
                value={formData.event_type_id}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-xl text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 ${
                  getFieldError('event_type_id')
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : isFieldValid('event_type_id')
                    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                disabled={loading}
              >
                <option value="">Selecione o tipo de evento</option>
                {eventTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {isFieldValid('event_type_id') && (
                <CheckCircle2 className="absolute right-8 top-3 w-5 h-5 text-green-500" />
              )}
              {getFieldError('event_type_id') && (
                <AlertCircle className="absolute right-8 top-3 w-5 h-5 text-red-500" />
              )}
            </div>
            {getFieldError('event_type_id') && (
              <p className="text-red-600 text-sm font-medium flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.event_type_id}</span>
              </p>
            )}
          </div>
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
                <span>{eventId ? 'Atualizar Evento' : 'Criar Evento'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EventForm