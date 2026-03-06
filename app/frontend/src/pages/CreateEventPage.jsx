import React from 'react'
import { useNavigate } from 'react-router-dom'
import EventForm from '../components/EventForm'
import Breadcrumb from '../components/Breadcrumb'

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
      <Breadcrumb 
        items={[
          { label: 'Eventos', href: '/events' }
        ]}
        current="Novo Evento"
      />
      
      <EventForm 
        onSuccess={handleSuccess}
        onClose={handleCancel}
      />
    </div>
  )
}

export default CreateEventPage