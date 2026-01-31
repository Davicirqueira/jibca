import React, { useState } from 'react'
import LoadingSpinner from './LoadingSpinner'

const ConfirmationButton = ({ eventId, currentStatus, onConfirmationChange }) => {
  const [loading, setLoading] = useState(false)

  const handleConfirmation = async (status) => {
    if (loading) return

    setLoading(true)
    try {
      await onConfirmationChange(status)
    } catch (error) {
      console.error('Erro ao confirmar presença:', error)
    } finally {
      setLoading(false)
    }
  }

  const getButtonStyle = (status) => {
    const isSelected = currentStatus === status
    const baseStyle = "px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
    
    if (loading) {
      return `${baseStyle} opacity-50 cursor-not-allowed`
    }

    switch (status) {
      case 'confirmed':
        return isSelected
          ? `${baseStyle} bg-green-600 text-white shadow-lg transform scale-105`
          : `${baseStyle} bg-green-100 text-green-700 hover:bg-green-200 border border-green-300`
      case 'declined':
        return isSelected
          ? `${baseStyle} bg-red-600 text-white shadow-lg transform scale-105`
          : `${baseStyle} bg-red-100 text-red-700 hover:bg-red-200 border border-red-300`
      case 'maybe':
        return isSelected
          ? `${baseStyle} bg-yellow-600 text-white shadow-lg transform scale-105`
          : `${baseStyle} bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300`
      default:
        return `${baseStyle} bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300`
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Confirmar Presença
      </h3>
      
      {currentStatus && (
        <div className="text-sm text-gray-600 mb-4">
          Status atual: 
          <span className="ml-2 font-medium">
            {currentStatus === 'confirmed' && '✅ Confirmado'}
            {currentStatus === 'declined' && '❌ Não vou'}
            {currentStatus === 'maybe' && '❓ Talvez'}
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => handleConfirmation('confirmed')}
          disabled={loading}
          className={getButtonStyle('confirmed')}
        >
          {loading && currentStatus !== 'confirmed' ? (
            <LoadingSpinner size="small" />
          ) : (
            <>
              <span>✅</span>
              <span>Vou participar</span>
            </>
          )}
        </button>

        <button
          onClick={() => handleConfirmation('maybe')}
          disabled={loading}
          className={getButtonStyle('maybe')}
        >
          {loading && currentStatus !== 'maybe' ? (
            <LoadingSpinner size="small" />
          ) : (
            <>
              <span>❓</span>
              <span>Talvez</span>
            </>
          )}
        </button>

        <button
          onClick={() => handleConfirmation('declined')}
          disabled={loading}
          className={getButtonStyle('declined')}
        >
          {loading && currentStatus !== 'declined' ? (
            <LoadingSpinner size="small" />
          ) : (
            <>
              <span>❌</span>
              <span>Não vou</span>
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Você pode alterar sua confirmação a qualquer momento antes do evento.
      </p>
    </div>
  )
}

export default ConfirmationButton