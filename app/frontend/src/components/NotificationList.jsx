import React, { useState, useEffect } from 'react'
import { notificationService } from '../services/notificationService'
import NotificationCard from './NotificationCard'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'
import { 
  Bell, 
  BellRing,
  Filter, 
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Inbox
} from 'lucide-react'

const NotificationList = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all') // all, unread, read
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalNotifications, setTotalNotifications] = useState(0)
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0
  })

  const itemsPerPage = 10

  useEffect(() => {
    loadNotifications()
  }, [currentPage, filter])

  // Polling para atualizações em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        loadNotifications(true) // Silent refresh
      }
    }, 60000) // A cada 1 minuto

    return () => clearInterval(interval)
  }, [loading, refreshing, currentPage, filter])

  const loadNotifications = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        filter: filter !== 'all' ? filter : undefined
      }

      const data = await notificationService.getNotifications(params)
      
      setNotifications(data.notifications || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalNotifications(data.pagination?.total || 0)
      
      // Calcular estatísticas
      if (data.stats) {
        setStats(data.stats)
      } else {
        calculateLocalStats(data.notifications || [])
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
      if (!silent) {
        toast.error('Erro ao carregar notificações')
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshNotifications = async () => {
    try {
      setRefreshing(true)
      await loadNotifications()
      toast.success('Notificações atualizadas!')
    } catch (error) {
      toast.error('Erro ao atualizar notificações')
    } finally {
      setRefreshing(false)
    }
  }

  const calculateLocalStats = (notificationsList) => {
    const total = notificationsList.length
    const unread = notificationsList.filter(n => !n.read_at).length
    const read = total - unread

    setStats({ total, unread, read })
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId)
      
      // Atualizar localmente
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      )
      
      // Atualizar estatísticas
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
        read: prev.read + 1
      }))

      toast.success('Notificação marcada como lida')
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
      toast.error('Erro ao marcar notificação como lida')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      
      // Atualizar todas as notificações localmente
      const now = new Date().toISOString()
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read_at: now }))
      )
      
      // Atualizar estatísticas
      setStats(prev => ({
        total: prev.total,
        unread: 0,
        read: prev.total
      }))

      toast.success('Todas as notificações foram marcadas como lidas')
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
      toast.error('Erro ao marcar todas as notificações como lidas')
    }
  }

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-8">
      {/* Header Corporativo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Bell className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Central de Notificações
            </h1>
            <p className="text-gray-600 font-medium">
              Acompanhe comunicações e lembretes importantes
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={refreshNotifications}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>

          {stats.unread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Marcar Todas como Lidas</span>
            </button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</h3>
          <p className="text-gray-600 font-medium">Total de Notificações</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-50 rounded-xl">
              <BellRing className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-yellow-600 mb-1">{stats.unread}</h3>
          <p className="text-gray-600 font-medium">Não Lidas</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-green-600 mb-1">{stats.read}</h3>
          <p className="text-gray-600 font-medium">Lidas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { key: 'all', label: 'Todas', icon: Bell },
                { key: 'unread', label: 'Não Lidas', icon: EyeOff },
                { key: 'read', label: 'Lidas', icon: Eye }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleFilterChange(option.key)}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    filter === option.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <option.icon className="w-4 h-4" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-500 font-medium">
            {totalNotifications} notificação{totalNotifications !== 1 ? 'ões' : ''} encontrada{totalNotifications !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Lista de Notificações */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === 'unread' ? 'Nenhuma notificação não lida' : 
             filter === 'read' ? 'Nenhuma notificação lida' : 
             'Nenhuma notificação encontrada'}
          </h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Você receberá notificações sobre eventos e atividades da juventude aqui.'
              : 'Tente ajustar os filtros para ver outras notificações.'
            }
          </p>
        </div>
      ) : (
        <>
          {/* Grid de Notificações */}
          <div className="space-y-4">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="text-sm text-gray-600">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalNotifications)} de {totalNotifications} notificações
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <span>Próxima</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default NotificationList