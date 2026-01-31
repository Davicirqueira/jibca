import React from 'react'
import { useNavigate } from 'react-router-dom'
import MemberForm from '../components/MemberForm'

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
      <MemberForm 
        onSuccess={handleSuccess}
        onClose={handleCancel}
      />
    </div>
  )
}

export default CreateMemberPage