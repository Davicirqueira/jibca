import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MemberList from '../components/MemberList'
import { Shield } from 'lucide-react'

const MembersPage = () => {
  const { isLeader } = useAuth()
  const navigate = useNavigate()

  const handleCreateMember = () => {
    navigate('/members/create')
  }

  const handleEditMember = (member) => {
    navigate(`/members/${member.id}/edit`)
  }

  // Verificar permissão de líder
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
      <MemberList
        onCreateMember={handleCreateMember}
        onEditMember={handleEditMember}
        showCreateButton={true}
      />
    </div>
  )
}

export default MembersPage