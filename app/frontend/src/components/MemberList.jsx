import React, { useState, useEffect } from 'react'
import { userService } from '../services/userService'
import { useAuth } from '../context/AuthContext'
import MemberCard from './MemberCard'
import LoadingSpinner from './LoadingSpinner'
import { toastManager } from '../utils/ToastManager'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  UserPlus,
  ChevronLeft, 
  ChevronRight,
  UserCheck,
  UserX,
  Shield,
  User,
  RefreshCw
} from 'lucide-react'

const MemberList = ({ onCreateMember, onEditMember, showCreateButton = true }) => {
  const { isLeader } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, active, inactive
  const [roleFilter, setRoleFilter] = useState('all') // all, leader, member
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalMembers, setTotalMembers] = useState(0)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    leaders: 0
  })

  const itemsPerPage = 12

  useEffect(() => {
    loadMembers()
  }, [currentPage, searchTerm, statusFilter, roleFilter])

  const loadMembers = async () => {
    try {
      setLoading(true)
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined
      }

      const data = await userService.getUsers(params)
      
      setMembers(data.users || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalMembers(data.pagination?.total || 0)
      
      // Calcular estatísticas locais se não fornecidas pela API
      if (data.stats) {
        setStats(data.stats)
      } else {
        calculateLocalStats(data.users || [])
      }
    } catch (error) {
      console.error('Erro ao carregar membros:', error)
      toastManager.error('Erro ao carregar lista de membros')
    } finally {
      setLoading(false)
    }
  }

  const refreshMembers = async () => {
    try {
      setRefreshing(true)
      await loadMembers()
      toastManager.success('Lista de membros atualizada!')
    } catch (error) {
      toastManager.error('Erro ao atualizar lista')
    } finally {
      setRefreshing(false)
    }
  }

  const calculateLocalStats = (membersList) => {
    const total = membersList.length
    const active = membersList.filter(m => m.active !== false && m.active !== 0).length
    const inactive = total - active
    const leaders = membersList.filter(m => m.role === 'leader').length

    setStats({ total, active, inactive, leaders })
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleRoleFilter = (role) => {
    setRoleFilter(role)
    setCurrentPage(1)
  }

  const handleToggleMemberStatus = async (memberId, newStatus) => {
    try {
      if (newStatus) {
        // Reativar membro (implementar quando necessário)
        toastManager.info('Funcionalidade de reativação será implementada')
      } else {
        await userService.deactivateUser(memberId)
        toastManager.success('Membro desativado com sucesso!')
        loadMembers() // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao alterar status do membro:', error)
      toastManager.error('Erro ao alterar status do membro')
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredStats = {
    total: totalMembers,
    active: stats.active,
    inactive: stats.inactive,
    leaders: stats.leaders
  }

  if (!isLeader()) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Acesso Restrito
        </h3>
        <p className="text-gray-600">
          Apenas líderes podem acessar a gestão de membros.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Corporativo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestão de Membros
            </h1>
            <p className="text-gray-600 font-medium">
              Administração completa do cadastro de participantes
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={refreshMembers}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>

          {showCreateButton && onCreateMember && (
            <button
              onClick={onCreateMember}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
            >
              <UserPlus className="w-4 h-4" />
              <span>Novo Membro</span>
            </button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{filteredStats.total}</h3>
          <p className="text-gray-600 font-medium">Total de Membros</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-green-600 mb-1">{filteredStats.active}</h3>
          <p className="text-gray-600 font-medium">Membros Ativos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-xl">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-red-600 mb-1">{filteredStats.inactive}</h3>
          <p className="text-gray-600 font-medium">Membros Inativos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-purple-600 mb-1">{filteredStats.leaders}</h3>
          <p className="text-gray-600 font-medium">Líderes</p>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Busca */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-4">
            {/* Filtro de Status */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { key: 'all', label: 'Todos', icon: Users },
                  { key: 'active', label: 'Ativos', icon: UserCheck },
                  { key: 'inactive', label: 'Inativos', icon: UserX }
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleStatusFilter(option.key)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                      statusFilter === option.key
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <option.icon className="w-3 h-3" />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro de Role */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Função:</span>
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { key: 'all', label: 'Todos', icon: Users },
                  { key: 'leader', label: 'Líderes', icon: Shield },
                  { key: 'member', label: 'Membros', icon: User }
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleRoleFilter(option.key)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                      roleFilter === option.key
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <option.icon className="w-3 h-3" />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Membros */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum membro encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
              ? 'Tente ajustar os filtros de busca.'
              : 'Comece adicionando o primeiro membro da juventude.'}
          </p>
          {showCreateButton && onCreateMember && (
            <button
              onClick={onCreateMember}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Primeiro Membro</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Grid de Membros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onEdit={onEditMember}
                onToggleStatus={handleToggleMemberStatus}
                isLeader={isLeader()}
              />
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="text-sm text-gray-600">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalMembers)} de {totalMembers} membros
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

export default MemberList