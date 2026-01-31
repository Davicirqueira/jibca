import React, { useState, useEffect } from 'react'
import { notificationService } from '../services/notificationService'
import { Bell, BellRing } from 'lucide-react'

const NotificationBadge = ({ className = '' }) => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUnreadCount()
    
    // Polling para atualizar contador a cada 30 segundos
    const interval = setInterval(loadUnreadCount, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error('Erro ao carregar contador de notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasUnread = unreadCount > 0

  return (
    <div className={`relative ${className}`}>
      {hasUnread ? (
        <BellRing className="w-5 h-5 text-yellow-600" />
      ) : (
        <Bell className="w-5 h-5 text-gray-600" />
      )}
      
      {hasUnread && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      
      {loading && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
      )}
    </div>
  )
}

export default NotificationBadge