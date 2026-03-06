import React from 'react'
import { useNavigate } from 'react-router-dom'
import MemberForm from '../components/MemberForm'
import Breadcrumb from '../components/Breadcrumb'

const CreateMemberPage = () => {
  const navigate = useNavigate()

  const handleSuccess = (member) => {
    // Redirecionar para a página de membros
    navigate('/members')
  }

  const handleCancel = () => {
    navigate('/members')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumb 
        items={[
          { label: 'Membros', href: '/members' }
        ]}
        current="Novo Membro"
      />
      
      <MemberForm 
        onSuccess={handleSuccess}
        onClose={handleCancel}
      />
    </div>
  )
}

export default CreateMemberPage