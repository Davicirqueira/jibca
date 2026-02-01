import React, { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { eventService } from '../services/eventService'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'
import { Link } from 'react-router-dom'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  MapPin,
  Users,
  ArrowRight
} from 'lucide-react'

const EventCalendar = ({ onEventClick, showCreateButton = false, onCreateEvent }) => {
  const { isLeader } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)
  const [hoveredDate, setHoveredDate] = useState(null)

  useEffect(() => {
    loadCalendarEvents()
  }, [currentDate])

  const loadCalendarEvents = async () => {
    try {
      setLoading(true)
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()
      
      const data = await eventService.getCalendarEvents(month, year)
      setEvents(data.events || [])
    } catch (error) {
      console.error('Erro ao carregar eventos do calendário:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1))
    setSelectedDate(null)
  }

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = parseISO(event.date)
      return isSameDay(eventDate, date)
    })
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

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Adicionar dias da semana anterior para completar a primeira semana
  const firstDayOfWeek = getDay(monthStart)
  const daysToAdd = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 // Começar na segunda-feira
  const startDate = new Date(monthStart)
  startDate.setDate(startDate.getDate() - daysToAdd)

  // Adicionar dias da próxima semana para completar a última semana
  const lastDayOfWeek = getDay(monthEnd)
  const daysToAddEnd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek
  const endDate = new Date(monthEnd)
  endDate.setDate(endDate.getDate() + daysToAddEnd)

  const allCalendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header Corporativo */}
      <div className="text-white p-6" style={{ background: 'linear-gradient(135deg, #8B0000 0%, #6B0000 100%)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              <p className="text-white text-sm font-medium opacity-80">
                Sistema de Gestão de Eventos JIBCA
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {showCreateButton && isLeader() && onCreateEvent && (
              <button
                onClick={onCreateEvent}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 border border-white/20"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Evento</span>
              </button>
            )}
            
            <div className="flex items-center space-x-1 bg-white/10 rounded-xl p-1">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                disabled={loading}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 hover:bg-white/20 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                Hoje
              </button>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                disabled={loading}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <div className="p-6">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekDays.map((day) => (
              <div key={day} className="text-center py-4 text-sm font-semibold text-gray-700 bg-gray-50 rounded-xl border border-gray-100">
                {day}
              </div>
            ))}
          </div>

          {/* Grade do calendário */}
          <div className="grid grid-cols-7 gap-1">
            {allCalendarDays.map((day, index) => {
              const dayEvents = getEventsForDate(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isDayToday = isToday(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isHovered = hoveredDate && isSameDay(day, hoveredDate)

              return (
                <div
                  key={index}
                  className={`
                    min-h-[120px] p-3 border border-gray-100 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02]
                    ${isCurrentMonth ? 'bg-white' : 'bg-gray-50/50'}
                    ${isDayToday ? 'ring-2 bg-red-50' : ''}
                    ${isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : ''}
                    ${isHovered ? 'shadow-lg bg-gray-50' : 'hover:shadow-md'}
                  `}
                  style={isDayToday ? { ringColor: '#8B0000' } : isHovered ? { backgroundColor: 'rgba(139,0,0,0.03)' } : {}}
                  onClick={() => setSelectedDate(day)}
                  onMouseEnter={() => setHoveredDate(day)}
                  onMouseLeave={() => setHoveredDate(null)}
                >
                  {/* Número do dia */}
                  <div className={`
                    text-sm font-bold mb-2 flex items-center justify-center w-7 h-7 rounded-full
                    ${isDayToday ? 'text-white font-bold' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  `}
                  style={isDayToday ? { backgroundColor: '#8B0000' } : {}}>
                    {format(day, 'd')}
                  </div>

                  {/* Eventos do dia */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event, eventIndex) => (
                      <Link
                        key={event.id}
                        to={`/events/${event.id}`}
                        className={`
                          block px-2 py-1 rounded-lg text-xs font-medium text-white truncate
                          ${getEventTypeColor(event.event_type_name)}
                          hover:opacity-90 transition-all duration-200
                          transform hover:scale-105 shadow-sm
                        `}
                        title={`${event.title} - ${event.time}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onEventClick) {
                            onEventClick(event)
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate font-medium">{event.title}</span>
                          <Clock className="w-3 h-3 ml-1 opacity-75" />
                        </div>
                      </Link>
                    ))}
                    
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-600 font-medium px-2 py-1 bg-gray-100 rounded-lg border">
                        +{dayEvents.length - 2} eventos
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legenda de tipos de evento */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Categorias de Eventos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { name: 'Culto', color: 'bg-blue-600' },
                { name: 'Retiro', color: 'bg-green-600' },
                { name: 'Reunião', color: 'bg-yellow-600' },
                { name: 'Estudo Bíblico', color: 'bg-purple-600' },
                { name: 'Confraternização', color: 'bg-red-600' },
                { name: 'Evangelismo', color: 'bg-cyan-600' },
                { name: 'Passeio', color: 'bg-emerald-600' },
              ].map((type) => (
                <div key={type.name} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                  <span className="text-xs font-medium text-gray-700">{type.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Eventos do dia selecionado */}
          {selectedDate && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <span>Eventos de {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</span>
              </h3>
              
              {getEventsForDate(selectedDate).length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Nenhum evento programado para esta data</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map((event) => (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-4 h-4 rounded-full ${getEventTypeColor(event.event_type_name).split(' ')[0]}`}></div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{event.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{event.time}</span>
                              </div>
                              {event.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-blue-600">
                          <span className="text-sm font-medium">Visualizar</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EventCalendar