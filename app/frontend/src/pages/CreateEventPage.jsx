import React from 'react'
import { useNavigate } from 'react-router-dom'
import EventForm from '../components/EventForm'

const CreateEventPage = () => {
  const navigate = useNavigate()

  const handleSuccess = (event) => {
    // Redirecionar para a página de detalhes do evento criado
    navigate(`/events/${event.id}`)
  }

  const handleCancel = () => {
    navigate('/events')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <EventForm 
        onSuccess={handleSuccess}
        onClose={handleCancel}
      />
    </div>
  )
}

export default CreateEventPage