import React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Edit3,
  MoreVertical
} from 'lucide-react'

const MemberCard = ({ member, onEdit, onToggleStatus, isLeader }) => {
  const isActive = member.active !== false && member.active !== 0

  const handleToggleStatus = () => {
    if (onToggleStatus) {
      onToggleStatus(member.id, !isActive)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(member)
    }
  }

  const getRoleColor = (role) => {
    return role === 'leader' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
  }

  const getRoleIcon = (role) => {
    return role === 'leader' ? Shield : User
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] ${
      isActive ? 'border-gray-100' : 'border-red-200 bg-red-50/30'
    }`}>
      <div className="p-6">
        {/* Header com Avatar e Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
              isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                {member.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${getRoleColor(member.role)}`}>
                  {React.createElement(getRoleIcon(member.role), { className: "w-3 h-3" })}
                  <span className="capitalize">{member.role === 'leader' ? 'Líder' : 'Membro'}</span>
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${
                  isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {isActive ? (
                    <>
                      <UserCheck className="w-3 h-3" />
                      <span>Ativo</span>
                    </>
                  ) : (
                    <>
                      <UserX className="w-3 h-3" />
                      <span>Inativo</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Menu de Ações (apenas para líderes) */}
          {isLeader && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEdit}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Editar membro"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <div className="relative group">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200">
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="p-2">
                    <button
                      onClick={handleToggleStatus}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {isActive ? 'Desativar Membro' : 'Reativar Membro'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Informações de Contato */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Mail className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
              <p className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                {member.email}
              </p>
            </div>
          </div>

          {member.phone && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Phone className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Telefone</p>
                <p className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                  {member.phone}
                </p>
              </div>
            </div>
          )}

          {member.created_at && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Membro desde</p>
                <p className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                  {format(parseISO(member.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer com Estatísticas (se disponível) */}
        {(member.events_participated || member.confirmations_count) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-center">
              {member.events_participated && (
                <div>
                  <p className="text-lg font-bold text-blue-600">{member.events_participated}</p>
                  <p className="text-xs text-gray-500 font-medium">Eventos Participados</p>
                </div>
              )}
              {member.confirmations_count && (
                <div>
                  <p className="text-lg font-bold text-green-600">{member.confirmations_count}</p>
                  <p className="text-xs text-gray-500 font-medium">Confirmações</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MemberCard