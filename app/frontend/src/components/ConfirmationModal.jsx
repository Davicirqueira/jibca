import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

/**
 * Modal de Confirmação alinhado com identidade JIBCA
 * 
 * @param {boolean} isOpen - Controla visibilidade do modal
 * @param {function} onClose - Callback ao fechar modal
 * @param {function} onConfirm - Callback ao confirmar ação
 * @param {string} title - Título do modal
 * @param {string} message - Mensagem explicativa
 * @param {string} confirmText - Texto do botão de confirmar (padrão: "Confirmar")
 * @param {string} cancelText - Texto do botão de cancelar (padrão: "Cancelar")
 * @param {string} type - Tipo de ação: 'danger' | 'warning' | 'info' (padrão: 'warning')
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar Ação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning'
}) => {
  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          confirmText: 'text-white'
        }
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmBg: 'bg-jibca-burgundy hover:bg-jibca-burgundyHover',
          confirmText: 'text-white'
        }
      case 'info':
        return {
          iconBg: 'bg-jibca-burgundy/10',
          iconColor: 'text-jibca-burgundy',
          confirmBg: 'bg-jibca-burgundy hover:bg-jibca-burgundyHover',
          confirmText: 'text-white'
        }
      default:
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmBg: 'bg-jibca-burgundy hover:bg-jibca-burgundyHover',
          confirmText: 'text-white'
        }
    }
  }

  const styles = getTypeStyles()

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`p-3 ${styles.iconBg} rounded-xl`}>
              <AlertTriangle className={`w-6 h-6 ${styles.iconColor}`} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-6 py-3 ${styles.confirmBg} ${styles.confirmText} rounded-xl font-medium transition-all duration-200 transform hover:scale-105`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
