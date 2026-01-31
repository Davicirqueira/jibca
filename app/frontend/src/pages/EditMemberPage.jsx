import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MemberForm from '../components/MemberForm'

const EditMemberPage = () => {
  const { id } = useParams()
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
        memberId={id}
        onSuccess={handleSuccess}
        onClose={handleCancel}
      />
    </div>
  )
}

export default EditMemberPage