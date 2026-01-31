import React, { useState, useEffect } from 'react'
import { eventService } from '../services/eventService'
import { confirmationService } from '../services/confirmationService'
import { useAuth } from '../context/AuthContext'
import EventCard from './EventCard'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'

const EventList = ({ 
  filters = {}, 
  showCreateButton = false, 
  onCreateEvent = null,
  showConfirmationButtons = true 
}) => {
  const { isLeader } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [eventTypes, setEventTypes] = useState([])
  const [selectedType, setSelectedType] = useState('')
  const [futureOnly, setFutureOnly] = useState(true)

  // Carregar tipos de evento
  useEffect(() => {
    const loadEventTypes = async () => {
      try {
        const types = await eventService.getEventTypes()
        setEventTypes(types)
      } catch (error) {
        console.error('Erro ao carregar tipos de evento:', error)
      }
    }
    loadEventTypes()
  }, [])

  // Carregar eventos
  useEffect(() => {
    loadEvents()
  }, [currentPage, selectedType, futureOnly, filters])

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        page: currentPage,
        limit: 12,
        future_only: futureOnly,
        ...filters
      }

      if (selectedType) {
        params.type = selectedType
      }

      const data = await eventService.getEvents(params)
      setEvents(data.events || [])
      setPagination(data.pagination || {})
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
      setError('Erro ao carregar eventos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPresence = async (eventId) => {
    try {
      await confirmationService.confirmPresence(eventId, 'confirmed')
      toast.success('Presença confirmada com sucesso!')
      
      // Recarregar eventos para atualizar contadores
      loadEvents()
    } catch (error) {
      console.error('Erro ao confirmar presença:', error)
      const errorMessage = error.response?.data?.error?.message || 'Erro ao confirmar presença'
      toast.error(errorMessage)
    }
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const handleTypeFilter = (typeId) => {
    setSelectedType(typeId)
    setCurrentPage(1) // Reset para primeira página
  }

  const handleFutureOnlyToggle = () => {
    setFutureOnly(!futureOnly)
    setCurrentPage(1) // Reset para primeira página
  }

  if (loading && events.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">❌</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Erro ao carregar eventos
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadEvents}
          className="btn-primary"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Eventos {futureOnly ? 'Próximos' : 'Todos'}
          </h2>
          <p className="text-gray-600">
            {pagination.total || 0} evento(s) encontrado(s)
          </p>
        </div>

        {showCreateButton && isLeader() && onCreateEvent && (
          <button
            onClick={onCreateEvent}
            className="btn-primary flex items-center space-x-2"
          >
            <span>+</span>
            <span>Novo Evento</span>
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Filtro por tipo */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Tipo:</label>
          <select
            value={selectedType}
            onChange={(e) => handleTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os tipos</option>
            {eventTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Toggle eventos futuros */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={futureOnly}
              onChange={handleFutureOnlyToggle}
              className="mr-2"
            />
            Apenas eventos futuros
          </label>
        </div>

        {/* Botão de refresh */}
        <button
          onClick={loadEvents}
          disabled={loading}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Carregando...' : '🔄 Atualizar'}
        </button>
      </div>

      {/* Lista de eventos */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum evento encontrado
          </h3>
          <p className="text-gray-600">
            {futureOnly 
              ? 'Não há eventos futuros no momento.' 
              : 'Não há eventos cadastrados.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              showConfirmationButton={showConfirmationButtons}
              onConfirm={handleConfirmPresence}
            />
          ))}
        </div>
      )}

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          
          <span className="text-sm text-gray-600">
            Página {currentPage} de {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pagination.totalPages}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  )
}

export default EventList