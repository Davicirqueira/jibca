import React from 'react'
import { format, parseISO, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Bell,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react'

const NotificationCard = ({ notification, onMarkAsRead }) => {
  const isUnread = !notification.read_at

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'event_reminder':
        return Calendar
      case 'event_created':
        return Calendar
      case 'event_updated':
        return Calendar
      case 'member_joined':
        return Users
      case 'system':
        return AlertCircle
      default:
        return Bell
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'event_reminder':
        return 'bg-yellow-100 text-yellow-600'
      case 'event_created':
        return 'bg-blue-100 text-blue-600'
      case 'event_updated':
        return 'bg-purple-100 text-purple-600'
      case 'member_joined':
        return 'bg-green-100 text-green-600'
      case 'system':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'event_reminder':
        return 'Lembrete de Evento'
      case 'event_created':
        return 'Novo Evento'
      case 'event_updated':
        return 'Evento Atualizado'
      case 'member_joined':
        return 'Novo Membro'
      case 'system':
        return 'Sistema'
      default:
        return 'Notificação'
    }
  }

  const formatDate = (dateString) => {
    const date = parseISO(dateString)
    
    if (isToday(date)) {
      return `Hoje às ${format(date, 'HH:mm')}`
    } else if (isYesterday(date)) {
      return `Ontem às ${format(date, 'HH:mm')}`
    } else {
      return format(date, "dd 'de' MMM 'às' HH:mm", { locale: ptBR })
    }
  }

  const handleMarkAsRead = () => {
    if (isUnread && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }
  }

  const IconComponent = getNotificationIcon(notification.type)

  return (
    <div 
      className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-lg transform hover:scale-[1.01] cursor-pointer ${
        isUnread ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'
      }`}
      onClick={handleMarkAsRead}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${getNotificationColor(notification.type)}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={`text-sm font-semibold ${isUnread ? 'text-blue-900' : 'text-gray-900'}`}>
                  {getTypeLabel(notification.type)}
                </h3>
                {isUnread && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {formatDate(notification.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isUnread ? (
              <div className="flex items-center space-x-1 text-blue-600">
                <EyeOff className="w-4 h-4" />
                <span className="text-xs font-medium">Não lida</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-gray-400">
                <Eye className="w-4 h-4" />
                <span className="text-xs font-medium">Lida</span>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="space-y-3">
          <h4 className={`text-lg font-bold ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
            {notification.title}
          </h4>
          
          <p className={`text-sm leading-relaxed ${isUnread ? 'text-gray-800' : 'text-gray-600'}`}>
            {notification.message}
          </p>

          {/* Metadados adicionais */}
          {notification.event_id && (
            <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
              <Calendar className="w-3 h-3" />
              <span>Relacionado ao evento ID: {notification.event_id}</span>
            </div>
          )}
        </div>

        {/* Footer com ações */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>
                {notification.read_at 
                  ? `Lida em ${formatDate(notification.read_at)}`
                  : 'Aguardando leitura'
                }
              </span>
            </div>

            {isUnread && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleMarkAsRead()
                }}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors"
              >
                <CheckCircle className="w-3 h-3" />
                <span>Marcar como lida</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationCard