import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import EventList from '../components/EventList'

const EventsPage = () => {
  const { isLeader } = useAuth()
  const navigate = useNavigate()

  const handleCreateEvent = () => {
    navigate('/events/create')
  }

  return (
    <div className="space-y-8">
      <EventList
        showCreateButton={isLeader()}
        onCreateEvent={handleCreateEvent}
        showConfirmationButtons={true}
      />
    </div>
  )
}

export default EventsPage