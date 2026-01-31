import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBadge from './NotificationBadge'
import MobileNavigation from './MobileNavigation'
import { 
  Home, 
  Calendar, 
  CalendarDays, 
  Bell, 
  Users, 
  User, 
  LogOut,
  Menu,
  X,
  Church
} from 'lucide-react'
import toast from 'react-hot-toast'

const Layout = ({ children }) => {
  const { user, logout, isLeader } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      toast.error('Erro ao fazer logout')
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Eventos', href: '/events', icon: Calendar },
    { name: 'Calendário', href: '/calendar', icon: CalendarDays },
    { name: 'Notificações', href: '/notifications', icon: Bell, badge: true },
    ...(isLeader() ? [{ name: 'Membros', href: '/members', icon: Users }] : []),
    { name: 'Perfil', href: '/profile', icon: User },
  ]

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* Header Corporativo */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Corporativo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors duration-200">
                  <Church className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    JIBCA
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">
                    Sistema de Agenda
                  </p>
                </div>
              </Link>
            </div>

            {/* Navegação Desktop */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.badge ? (
                      <NotificationBadge />
                    ) : (
                      <IconComponent className="w-4 h-4" />
                    )}
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Menu do Usuário */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize font-medium">{user?.role}</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>

              {/* Botão Menu Mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menu Mobile Expandido */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 mobile-nav-item ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.badge ? (
                      <NotificationBadge />
                    ) : (
                      <IconComponent className="w-5 h-5" />
                    )}
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
            <div className="border-t border-gray-200 px-4 py-3">
              <p className="text-base font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        )}
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto container-responsive py-4 sm:py-6 lg:py-8 full-height-mobile">
        {children}
      </main>

      {/* Navegação Mobile Fixa */}
      <MobileNavigation />

      {/* Rodapé Corporativo */}
      <footer className="bg-white border-t border-gray-200 mt-auto mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto container-responsive py-6">
          <div className="text-center text-sm text-gray-500">
            <p>© 2026 JIBCA - Juventude da Igreja Batista. Sistema desenvolvido com excelência técnica.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout