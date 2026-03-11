import { useState, useRef } from 'react'
import { Camera, X, Upload, Loader } from 'lucide-react'
import { toastManager } from '../utils/ToastManager'

const AvatarUpload = ({ 
  currentAvatarUrl, 
  userName, 
  onUploadSuccess, 
  onDeleteSuccess,
  size = 'large' // 'small', 'medium', 'large'
}) => {
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Tamanhos do avatar
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  }

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  }

  // Obter iniciais do nome
  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Validar arquivo
  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      toastManager.error('Tipo de arquivo inválido. Apenas JPG, PNG e GIF são permitidos')
      return false
    }

    if (file.size > maxSize) {
      toastManager.error('Arquivo muito grande. Tamanho máximo: 5MB')
      return false
    }

    return true
  }

  // Manipular seleção de arquivo
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!validateFile(file)) {
      event.target.value = '' // Limpar input
      return
    }

    // Criar preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Fazer upload
    handleUpload(file)
  }

  // Fazer upload
  const handleUpload = async (file) => {
    try {
      setUploading(true)

      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/profile/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        // Tratamento de erros específicos
        if (response.status === 403) {
          throw new Error('Você não tem permissão para fazer upload de avatar')
        } else if (response.status === 413) {
          throw new Error('Arquivo muito grande. Tamanho máximo: 5MB')
        } else if (response.status === 400) {
          throw new Error(data.error?.message || 'Arquivo inválido')
        } else if (response.status >= 500) {
          throw new Error('Erro no servidor. Tente novamente mais tarde')
        } else {
          throw new Error(data.error?.message || 'Erro ao fazer upload')
        }
      }

      toastManager.success('Avatar atualizado com sucesso!')
      
      if (onUploadSuccess) {
        onUploadSuccess(data.data.user)
      }

      setPreview(null)

    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      
      // Tratamento específico para erros de rede
      if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        toastManager.error('Erro de conexão. Verifique sua internet e tente novamente')
      } else {
        toastManager.error(error.message || 'Erro ao fazer upload de avatar')
      }
      
      setPreview(null)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Remover avatar
  const handleDelete = async () => {
    if (!currentAvatarUrl) return

    try {
      setUploading(true)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/profile/avatar`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        // Tratamento de erros específicos
        if (response.status === 403) {
          throw new Error('Você não tem permissão para remover este avatar')
        } else if (response.status === 404) {
          throw new Error('Avatar não encontrado')
        } else if (response.status >= 500) {
          throw new Error('Erro no servidor. Tente novamente mais tarde')
        } else {
          throw new Error(data.error?.message || 'Erro ao remover avatar')
        }
      }

      toastManager.success('Avatar removido com sucesso!')
      
      if (onDeleteSuccess) {
        onDeleteSuccess(data.data.user)
      }

    } catch (error) {
      console.error('Erro ao remover avatar:', error)
      
      // Tratamento específico para erros de rede
      if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        toastManager.error('Erro de conexão. Verifique sua internet e tente novamente')
      } else {
        toastManager.error(error.message || 'Erro ao remover avatar')
      }
    } finally {
      setUploading(false)
    }
  }

  // Abrir seletor de arquivo
  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  const avatarUrl = preview || currentAvatarUrl

  return (
    <div className="relative inline-block">
      {/* Avatar */}
      <div className={`${sizeClasses[size]} rounded-2xl overflow-hidden bg-gradient-to-br from-jibca-burgundy to-jibca-burgundyPressed flex items-center justify-center relative`}>
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={userName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white font-bold text-2xl">
            {getInitials(userName)}
          </span>
        )}

        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader className={`${iconSizes[size]} text-white animate-spin`} />
          </div>
        )}
      </div>

      {/* Botões de ação */}
      <div className="absolute -bottom-2 -right-2 flex gap-1">
        {/* Botão de upload */}
        <button
          onClick={openFileSelector}
          disabled={uploading}
          className="p-2 bg-jibca-burgundy hover:bg-jibca-burgundyHover rounded-full text-white transition-colors duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          title="Alterar foto"
        >
          <Camera className={iconSizes[size]} />
        </button>

        {/* Botão de remover (apenas se tiver avatar) */}
        {currentAvatarUrl && !uploading && (
          <button
            onClick={handleDelete}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors duration-200 shadow-lg"
            title="Remover foto"
          >
            <X className={iconSizes[size]} />
          </button>
        )}
      </div>

      {/* Input de arquivo (oculto) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}

export default AvatarUpload
