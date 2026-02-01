import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format, parseISO, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { eventService } from '../services/eventService'
import { confirmationService } from '../services/confirmationService'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'
import ConfirmationButton from './ConfirmationButton'
import toast from 'react-hot-toast'
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowLeft,
  Edit3,
  Trash2,
  Users,
  CheckCircle,
  XCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react'

const EventDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isLeader } = useAuth()
  
  const [event, setEvent] = useState(null)
  const [confirmations, setConfirmations] = useState([])
  const [myConfirmation, setMyConfirmation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadEventDetails()
  }, [id])

  const loadEventDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // Carregar detalhes do evento
      const eventData = await eventService.getEventById(id)
      setEvent(eventData)

      // Carregar confirmações
      const confirmationsData = await confirmationService.getEventConfirmations(id)
      setConfirmations(confirmationsData)

      // Carregar minha confirmação
      try {
        const myConfirmationData = await confirmationService.getMyConfirmation(id)
        setMyConfirmation(myConfirmationData)
      } catch (error) {
        // Usuário ainda não confirmou
        setMyConfirmation(null)
      }

    } catch (error) {
      console.error('Erro ao carregar detalhes do evento:', error)
      setError('Erro ao carregar detalhes do evento')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmationChange = async (status) => {
    try {
      await confirmationService.confirmPresence(id, status)
      toast.success('Confirmação atualizada com sucesso!')
      
      // Recarregar dados
      loadEventDetails()
    } catch (error) {
      console.error('Erro ao atualizar confirmação:', error)
      toast.error('Erro ao atualizar confirmação')
    }
  }

  const handleDeleteEvent = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      await eventService.deleteEvent(id)
      toast.success('Evento excluído com sucesso!')
      navigate('/events')
    } catch (error) {
      console.error('Erro ao excluir evento:', error)
      toast.error('Erro ao excluir evento')
    }
  }

  const getEventTypeColor = (eventTypeName) => {
    const colors = {
      'Culto': 'bg-blue-600 border-blue-700',
      'Retiro': 'bg-green-600 border-green-700',
      'Reunião': 'bg-yellow-600 border-yellow-700',
      'Estudo Bíblico': 'bg-purple-600 border-purple-700',
      'Confraternização': 'bg-red-600 border-red-700',
      'Evangelismo': 'bg-cyan-600 border-cyan-700',
      'Passeio': 'bg-emerald-600 border-emerald-700',
    }
    return colors[eventTypeName] || 'bg-gray-600 border-gray-700'
  }

  const getConfirmationStats = () => {
    const confirmed = confirmations.filter(c => c.status === 'confirmed').length
    const declined = confirmations.filter(c => c.status === 'declined').length
    const maybe = confirmations.filter(c => c.status === 'maybe').length
    const total = confirmations.length

    return { confirmed, declined, maybe, total }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {error || 'Evento não encontrado'}
        </h3>
        <Link 
          to="/events" 
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para eventos</span>
        </Link>
      </div>
    )
  }

  const eventDate = parseISO(event.date)
  const isUpcoming = isAfter(eventDate, new Date())
  const stats = getConfirmationStats()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Corporativo */}
      <div className="flex items-center justify-between">
        <Link 
          to="/events" 
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para eventos</span>
        </Link>

        {isLeader() && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/events/${id}/edit`)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar</span>
            </button>
            <button
              onClick={handleDeleteEvent}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir</span>
            </button>
          </div>
        )}
      </div>

      {/* Informações do Evento */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`${getEventTypeColor(event.event_type_name)} text-white px-4 py-2 rounded-xl font-medium shadow-sm`}>
                  {event.event_type_name}
                </div>
                {!isUpcoming && (
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-xl text-sm font-medium border border-gray-200">
                    Evento Finalizado
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {event.title}
              </h1>
              
              {event.description && (
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {event.description}
                </p>
              )}
            </div>
          </div>

          {/* Grade de Detalhes do Evento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Data do Evento</p>
                  <p className="text-gray-600 font-medium">
                    {format(eventDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Horário</p>
                  <p className="text-gray-600 font-medium">
                    {event.time}
                    {event.duration_minutes && (
                      <span className="ml-2 text-gray-500">
                        ({event.duration_minutes} minutos)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {event.location && (
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Local</p>
                    <p className="text-gray-600 font-medium">{event.location}</p>
                  </div>
                </div>
              )}
              
              {event.created_by_name && (
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <User className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Organizador</p>
                    <p className="text-gray-600 font-medium">{event.created_by_name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botão de Confirmação */}
          {isUpcoming && (
            <div className="border-t border-gray-200 pt-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Confirme sua presença
                </h3>
                <ConfirmationButton
                  eventId={id}
                  currentStatus={myConfirmation?.status}
                  onConfirmationChange={handleConfirmationChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estatísticas de Confirmação */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Confirmações de Presença
            </h2>
          </div>

          {stats.total === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">
                Ainda não há confirmações para este evento.
              </p>
            </div>
          ) : (
            <>
              {/* Resumo das Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stats.total}</div>
                  <div className="text-sm font-medium text-gray-600">Total de Respostas</div>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-100">
                  <div className="text-3xl font-bold text-green-600 mb-2">{stats.confirmed}</div>
                  <div className="text-sm font-medium text-gray-600">Confirmados</div>
                </div>
                <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-100">
                  <div className="text-3xl font-bold text-red-600 mb-2">{stats.declined}</div>
                  <div className="text-sm font-medium text-gray-600">Não Participarão</div>
                </div>
                <div className="text-center p-6 bg-yellow-50 rounded-2xl border border-yellow-100">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.maybe}</div>
                  <div className="text-sm font-medium text-gray-600">Talvez</div>
                </div>
              </div>

              {/* Lista de Confirmações */}
              <div className="space-y-3">
                {confirmations.map((confirmation) => (
                  <div
                    key={confirmation.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">
                          {confirmation.user_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {confirmation.user_name}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {confirmation.status === 'confirmed' && (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-xl text-sm font-medium">
                              Confirmado
                            </span>
                          </>
                        )}
                        {confirmation.status === 'declined' && (
                          <>
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-xl text-sm font-medium">
                              Não vai
                            </span>
                          </>
                        )}
                        {confirmation.status === 'maybe' && (
                          <>
                            <HelpCircle className="w-5 h-5 text-yellow-600" />
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-xl text-sm font-medium">
                              Talvez
                            </span>
                          </>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        {format(parseISO(confirmation.confirmed_at), 'dd/MM HH:mm')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventDetails