import React from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const EventCard = ({ event, showConfirmationButton = true, onConfirm }) => {
  const eventDate = parseISO(event.date)
  const isUpcoming = isAfter(eventDate, new Date())

  const getEventTypeColor = (eventTypeName) => {
    const colors = {
      'Culto': 'bg-blue-500',
      'Retiro': 'bg-green-500',
      'Reunião': 'bg-yellow-500',
      'Estudo Bíblico': 'bg-purple-500',
      'Confraternização': 'bg-red-500',
      'Evangelismo': 'bg-cyan-500',
      'Passeio': 'bg-emerald-500',
    }
    return colors[eventTypeName] || 'bg-gray-500'
  }

  const getConfirmationStats = () => {
    const total = event.total_confirmations || 0
    const confirmed = event.confirmed_count || 0
    const declined = event.declined_count || 0
    const maybe = event.maybe_count || 0

    return { total, confirmed, declined, maybe }
  }

  const stats = getConfirmationStats()

  return (
    <div className="card hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`${getEventTypeColor(event.event_type_name)} text-white px-3 py-1 rounded-full text-sm font-medium`}>
              {event.event_type_name}
            </div>
            {!isUpcoming && (
              <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                Passado
              </span>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {event.title}
          </h3>
          
          {event.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
      </div>

      {/* Event Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">📅</span>
          <span>
            {format(eventDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">🕐</span>
          <span>{event.time}</span>
          {event.duration_minutes && (
            <span className="ml-2 text-gray-500">
              ({event.duration_minutes} min)
            </span>
          )}
        </div>
        
        {event.location && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📍</span>
            <span>{event.location}</span>
          </div>
        )}
        
        {event.created_by_name && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">👤</span>
            <span>Criado por {event.created_by_name}</span>
          </div>
        )}
      </div>

      {/* Confirmation Stats */}
      {stats.total > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Confirmações ({stats.total})
          </div>
          <div className="flex space-x-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span>{stats.confirmed} Confirmados</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span>{stats.declined} Não vão</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
              <span>{stats.maybe} Talvez</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Link
          to={`/events/${event.id}`}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
        >
          Ver detalhes →
        </Link>
        
        {showConfirmationButton && isUpcoming && onConfirm && (
          <button
            onClick={() => onConfirm(event.id)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Confirmar Presença
          </button>
        )}
      </div>
    </div>
  )
}

export default EventCard