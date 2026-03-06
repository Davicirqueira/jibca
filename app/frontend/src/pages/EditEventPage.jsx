import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import EventForm from '../components/EventForm'
import Breadcrumb from '../components/Breadcrumb'

const EditEventPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const handleSuccess = (event) => {
    // Redirecionar para a página de detalhes do evento atualizado
    navigate(`/events/${event.id}`)
  }

  const handleCancel = () => {
    navigate(`/events/${id}`)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumb 
        items={[
          { label: 'Eventos', href: '/events' },
          { label: 'Detalhes', href: `/events/${id}` }
        ]}
        current="Editar Evento"
      />
      
      <EventForm 
        eventId={id}
        onSuccess={handleSuccess}
        onClose={handleCancel}
      />
    </div>
  )
}

export default EditEventPage