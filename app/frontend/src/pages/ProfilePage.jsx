import React from 'react'
import { useAuth } from '../context/AuthContext'

const ProfilePage = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>

      <div className="card">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {user?.name}
          </h2>
          <p className="text-gray-600 mb-4">
            {user?.email}
          </p>
          <p className="text-sm text-gray-500 capitalize">
            Role: {user?.role}
          </p>
          
          <div className="mt-8">
            <p className="text-gray-600">
              Funcionalidade de edição de perfil será implementada nas próximas tasks.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage