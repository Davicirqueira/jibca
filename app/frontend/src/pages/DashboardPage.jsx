import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import EventCalendar from '../components/EventCalendar'
import VerseOfTheDay from '../components/VerseOfTheDay'
import { 
  Calendar, 
  CalendarDays, 
  Bell, 
  Users, 
  User,
  TrendingUp,
  Activity,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

const DashboardPage = () => {
  const { user, isLeader } = useAuth()

  const quickActions = [
    {
      title: 'Gerenciar Eventos',
      description: 'Visualize e gerencie todos os eventos da juventude',
      href: '/events',
      icon: Calendar,
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700'
    },
    {
      title: 'Visualização Calendário',
      description: 'Interface calendário para planejamento estratégico',
      href: '/calendar',
      icon: CalendarDays,
      color: 'bg-indigo-600',
      hoverColor: 'hover:bg-indigo-700'
    },
    {
      title: 'Central de Notificações',
      description: 'Acompanhe comunicações e lembretes importantes',
      href: '/notifications',
      icon: Bell,
      color: 'bg-red-900',
      hoverColor: 'hover:bg-red-800',
      priority: true
    },
    ...(isLeader() ? [{
      title: 'Administração de Membros',
      description: 'Gestão completa do cadastro de participantes',
      href: '/members',
      icon: Users,
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700'
    }] : []),
    {
      title: 'Configurações de Perfil',
      description: 'Atualize suas informações pessoais e preferências',
      href: '/profile',
      icon: User,
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Seção de Boas-vindas Corporativa */}
      <div className="rounded-2xl text-white p-8 shadow-2xl border border-gray-800" style={{ backgroundColor: '#8B0000' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Avatar do Usuário */}
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
              <span className="text-lg font-bold text-white">
                {user?.name?.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2 animate-fade-in" style={{ letterSpacing: '-0.5px' }}>
                Bem-vindo, {user?.name}
              </h1>
              <p className="text-white text-lg font-medium opacity-90">
                {isLeader() 
                  ? 'Painel de controle administrativo - Acesso completo ao sistema' 
                  : 'Portal do participante - Acompanhe eventos e atividades da juventude'
                }
              </p>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="text-right">
              <p className="text-white text-sm font-medium opacity-80">Função no Sistema</p>
              <p className="text-white text-xl font-bold">
                {user?.role === 'leader' ? 'Líder' : user?.role === 'member' ? 'Membro' : user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Módulos de Ação Rápida */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Módulos do Sistema</h2>
          <div className="text-sm text-gray-500 font-medium">
            Acesso rápido às funcionalidades principais
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <Link
                key={index}
                to={action.href}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
                style={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  '--hover-shadow': '0 8px 24px rgba(0,0,0,0.12)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`${action.color} ${action.hoverColor} text-white p-4 rounded-xl transition-all duration-200 group-hover:scale-110 shadow-sm`}
                       style={{ width: '56px', height: '56px' }}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {action.description}
                    </p>
                    <div className="flex items-center text-sm font-medium transition-colors duration-200"
                         style={{ color: action.priority ? '#8B0000' : '#3b82f6' }}
                         onMouseEnter={(e) => e.target.style.color = action.priority ? '#A52A2A' : '#2563eb'}
                         onMouseLeave={(e) => e.target.style.color = action.priority ? '#8B0000' : '#3b82f6'}>
                      <span>Acessar módulo</span>
                      <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Visualização Calendário Integrada */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Calendário Mensal</h2>
          <Link 
            to="/calendar" 
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <span>Visualização completa</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="transform scale-95 origin-top">
          <EventCalendar 
            showCreateButton={false}
            onEventClick={() => {}}
          />
        </div>
      </div>

      {/* Painel de Estatísticas (Líderes) */}
      {isLeader() && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Métricas Operacionais</h2>
            <div className="text-sm text-gray-500 font-medium">
              Indicadores de performance do sistema
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 group hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">—</h3>
              <p className="text-gray-600 font-medium">Eventos Programados</p>
              <p className="text-xs text-gray-500 mt-2">Aguardando integração de dados</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 group hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">—</h3>
              <p className="text-gray-600 font-medium">Membros Ativos</p>
              <p className="text-xs text-gray-500 mt-2">Cadastros validados no sistema</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 group hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">—</h3>
              <p className="text-gray-600 font-medium">Confirmações Ativas</p>
              <p className="text-xs text-gray-500 mt-2">Participações confirmadas</p>
            </div>
          </div>
        </div>
      )}

      {/* Seção Inspiracional Corporativa */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-8 border border-slate-200">
        <div className="text-center max-w-4xl mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
          <blockquote className="text-2xl text-slate-700 font-medium leading-relaxed mb-6 font-serif">
            "Porque onde estiverem dois ou três reunidos em meu nome, aí estou eu no meio deles."
          </blockquote>
          <cite className="text-blue-600 font-semibold text-lg">Mateus 18:20</cite>
          <div className="mt-4 text-sm text-slate-500 font-medium">
            Fundamento espiritual da comunidade JIBCA
          </div>
        </div>
      </div>

      {/* Versículo do Dia Modal */}
      <VerseOfTheDay />
    </div>
  )
}

export default DashboardPage