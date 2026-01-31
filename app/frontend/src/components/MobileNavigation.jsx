import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBadge from './NotificationBadge'
import { 
  Home, 
  Calendar, 
  CalendarDays, 
  Bell, 
  Users, 
  User
} from 'lucide-react'

const MobileNavigation = () => {
  const { isLeader } = useAuth()
  const location = useLocation()

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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden safe-area-inset">
      <div className="grid grid-cols-5 h-16">
        {navigation.slice(0, 5).map((item) => {
          const IconComponent = item.icon
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 touch-target ${
                isActive(item.href)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 active:bg-gray-100'
              }`}
            >
              <div className="relative">
                {item.badge ? (
                  <NotificationBadge />
                ) : (
                  <IconComponent className="w-5 h-5" />
                )}
              </div>
              <span className="text-xs font-medium line-clamp-1">
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileNavigation