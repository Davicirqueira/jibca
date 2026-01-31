import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import EventCalendar from '../components/EventCalendar'
import { 
  Calendar,
  MousePointer,
  ArrowLeft,
  ArrowRight,
  Target
} from 'lucide-react'

const CalendarPage = () => {
  const { isLeader } = useAuth()
  const navigate = useNavigate()

  const handleCreateEvent = () => {
    navigate('/events/create')
  }

  const handleEventClick = (event) => {
    // Evento já é tratado pelo Link no componente
    console.log('Evento clicado:', event.title)
  }

  return (
    <div className="space-y-8">
      {/* Header Corporativo */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Calendário de Eventos
          </h1>
        </div>
        <p className="text-gray-600 text-lg font-medium max-w-2xl mx-auto">
          Visualize todos os eventos da juventude JIBCA em um calendário interativo de nível corporativo
        </p>
      </div>

      {/* Calendário */}
      <EventCalendar
        onEventClick={handleEventClick}
        showCreateButton={isLeader()}
        onCreateEvent={handleCreateEvent}
      />

      {/* Guia de Utilização Corporativo */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-8 border border-slate-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Guia de Utilização do Sistema
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
          <div className="flex items-start space-x-3 p-4 bg-white rounded-xl border border-gray-100">
            <MousePointer className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 mb-1">Seleção de Data</p>
              <p>Clique em qualquer dia para visualizar eventos programados</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-white rounded-xl border border-gray-100">
            <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 mb-1">Detalhes do Evento</p>
              <p>Clique em qualquer evento para acessar informações completas</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-white rounded-xl border border-gray-100">
            <ArrowLeft className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 mb-1">Navegação Temporal</p>
              <p>Utilize as setas para navegar entre diferentes meses</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-white rounded-xl border border-gray-100">
            <Target className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 mb-1">Retorno Rápido</p>
              <p>Botão "Hoje" para retornar instantaneamente ao mês atual</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarPage