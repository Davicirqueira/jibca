import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { eventService } from '../services/eventService'
import { useAuth } from '../context/AuthContext'
import { useFormValidation } from '../hooks/useFormValidation'
import { eventSchema } from '../schemas/validationSchemas'
import LoadingSpinner from './LoadingSpinner'
import FormInput from './form/FormInput'
import FormSelect from './form/FormSelect'
import FormTextarea from './form/FormTextarea'
import FormSubmitButton from './form/FormSubmitButton'
import { toastManager } from '../utils/ToastManager'
import { 
  Calendar,
  Save,
  ArrowLeft
} from 'lucide-react'

const EventForm = ({ eventId = null, onClose = null, onSuccess = null }) => {
  const { isLeader } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [eventTypes, setEventTypes] = useState([])
  const [submitError, setSubmitError] = useState(null)
  const [lastSubmitAttempt, setLastSubmitAttempt] = useState(null)

  // Configurar validação do formulário
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    isFieldValid,
    isSubmitting,
    setValue
  } = useFormValidation(eventSchema, {
    defaultValues: {
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      event_type_id: ''
    },
    onSubmitSuccess: (result) => {
      const message = eventId ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!';
      toastManager.success(message);
      
      // Limpar estados de erro
      setSubmitError(null);
      setLastSubmitAttempt(null);
      
      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate('/events');
      }
    },
    onSubmitError: (error) => {
      setSubmitError(error);
      setLastSubmitAttempt(Date.now());
    }
  });

  // Verificar permissão de líder
  useEffect(() => {
    if (!isLeader()) {
      toastManager.error('Acesso negado: Apenas líderes podem gerenciar eventos')
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
      toastManager.error('Erro ao carregar tipos de evento')
    } finally {
      setLoadingTypes(false)
    }
  }

  const loadEventData = async () => {
    try {
      setLoading(true)
      const event = await eventService.getEventById(eventId)
      
      // Atualizar formulário com dados do evento
      setValue('title', event.title || '')
      setValue('description', event.description || '')
      setValue('date', event.date || '')
      setValue('time', event.time || '')
      setValue('location', event.location || '')
      setValue('event_type_id', event.event_type_id || '')
    } catch (error) {
      console.error('Erro ao carregar evento:', error)
      toastManager.error('Erro ao carregar dados do evento')
    } finally {
      setLoading(false)
    }
  }

  // Função de submit do formulário
  const onSubmit = async (data) => {
    // Limpar erro anterior ao tentar novamente
    setSubmitError(null);
    
    const eventData = {
      ...data,
      title: data.title.trim(),
      description: data.description?.trim() || '',
      location: data.location?.trim() || ''
    }

    if (eventId) {
      return await eventService.updateEvent(eventId, eventData)
    } else {
      return await eventService.createEvent(eventData)
    }
  }

  const handleCancel = () => {
    if (onClose) {
      onClose()
    } else {
      navigate('/events')
    }
  }

  // Preparar opções para o select de tipos de evento
  const eventTypeOptions = eventTypes.map(type => ({
    value: type.id,
    label: type.name
  }))

  if (loadingTypes) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
        <span className="ml-3 text-gray-600">Carregando dados do evento...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 to-red-800 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {eventId ? 'Editar Evento' : 'Criar Novo Evento'}
              </h1>
              <p className="text-red-100 mt-1">
                {eventId ? 'Atualize as informações do evento' : 'Preencha os dados para criar um novo evento'}
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {/* Título */}
          <FormInput
            label="Título do Evento"
            name="title"
            placeholder="Digite o título do evento"
            register={register}
            error={errors.title}
            isValid={isFieldValid('title')}
            required
            disabled={isSubmitting}
          />

          {/* Descrição */}
          <FormTextarea
            label="Descrição"
            name="description"
            placeholder="Descreva o evento (opcional)"
            rows={4}
            maxLength={500}
            register={register}
            error={errors.description}
            isValid={isFieldValid('description')}
            disabled={isSubmitting}
          />

          {/* Data e Horário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Data"
              name="date"
              type="date"
              register={register}
              error={errors.date}
              isValid={isFieldValid('date')}
              required
              disabled={isSubmitting}
            />

            <FormInput
              label="Horário"
              name="time"
              type="time"
              register={register}
              error={errors.time}
              isValid={isFieldValid('time')}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Local e Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Local"
              name="location"
              placeholder="Local do evento (opcional)"
              register={register}
              error={errors.location}
              isValid={isFieldValid('location')}
              disabled={isSubmitting}
            />

            <FormSelect
              label="Tipo de Evento"
              name="event_type_id"
              placeholder="Selecione o tipo de evento"
              options={eventTypeOptions}
              register={register}
              error={errors.event_type_id}
              isValid={isFieldValid('event_type_id')}
              required
              disabled={isSubmitting}
              valueAsNumber={true}
            />
          </div>

          {/* Error Display */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    Erro ao {eventId ? 'atualizar' : 'criar'} evento
                  </h3>
                  <div className="mt-1 text-sm text-red-700">
                    <p>
                      {submitError.response?.data?.error?.message || 
                       submitError.message || 
                       'Ocorreu um erro inesperado. Tente novamente.'}
                    </p>
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setSubmitError(null)}
                      className="text-sm text-red-600 hover:text-red-500 font-medium"
                    >
                      Dispensar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
              disabled={isSubmitting}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Cancelar</span>
            </button>

            <FormSubmitButton
              isLoading={isSubmitting}
              isValid={isValid}
              hasErrors={Object.keys(errors).length > 0}
              showRetryHint={submitError && !isSubmitting}
              loadingText={eventId ? 'Atualizando...' : 'Criando...'}
              className="flex items-center space-x-2 px-8"
            >
              <Save className="w-4 h-4" />
              <span>{eventId ? 'Atualizar Evento' : 'Criar Evento'}</span>
            </FormSubmitButton>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventForm