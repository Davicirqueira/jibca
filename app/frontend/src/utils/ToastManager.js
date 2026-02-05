import toast from 'react-hot-toast';

/**
 * Sistema de gerenciamento de toasts com deduplicação
 * Garante que apenas um toast seja exibido por vez
 */
class ToastManager {
  constructor() {
    this.activeToasts = new Set();
    this.maxToasts = 1; // APENAS 1 toast por vez
    this.toastIds = new Map(); // Mapear mensagens para IDs de toast
  }

  /**
   * Exibe um toast com deduplicação
   * @param {string} message - Mensagem do toast
   * @param {string} type - Tipo do toast ('success', 'error', 'info')
   * @param {object} options - Opções adicionais
   */
  show(message, type = 'info', options = {}) {
    // Se já existe toast idêntico, ignorar
    if (this.activeToasts.has(message)) {
      return this.toastIds.get(message);
    }

    // Se já tem toast ativo, remover antes de adicionar novo
    if (this.activeToasts.size >= this.maxToasts) {
      this.clearAll();
    }

    this.activeToasts.add(message);

    const defaultOptions = {
      duration: type === 'error' ? 6000 : 4000,
      onClose: () => {
        this.activeToasts.delete(message);
        this.toastIds.delete(message);
      },
      ...options
    };

    // Mostrar toast usando react-hot-toast
    const toastId = toast[type](message, defaultOptions);
    
    // Armazenar ID do toast
    this.toastIds.set(message, toastId);

    return toastId;
  }

  /**
   * Remove todos os toasts ativos
   */
  clearAll() {
    this.activeToasts.clear();
    this.toastIds.clear();
    toast.dismiss(); // Remove todos os toasts visíveis
  }

  /**
   * Remove um toast específico
   * @param {string} message - Mensagem do toast a ser removido
   */
  dismiss(message) {
    if (this.activeToasts.has(message)) {
      const toastId = this.toastIds.get(message);
      if (toastId) {
        toast.dismiss(toastId);
      }
      this.activeToasts.delete(message);
      this.toastIds.delete(message);
    }
  }

  /**
   * Verifica se um toast específico está ativo
   * @param {string} message - Mensagem do toast
   * @returns {boolean}
   */
  isActive(message) {
    return this.activeToasts.has(message);
  }

  /**
   * Retorna o número de toasts ativos
   * @returns {number}
   */
  getActiveCount() {
    return this.activeToasts.size;
  }

  /**
   * Métodos de conveniência
   */
  success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  error(message, options = {}) {
    return this.show(message, 'error', options);
  }

  info(message, options = {}) {
    return this.show(message, 'info', options);
  }

  loading(message, options = {}) {
    return this.show(message, 'loading', options);
  }

  /**
   * Método para mostrar toast de promessa (loading -> success/error)
   * @param {Promise} promise - Promise a ser executada
   * @param {object} messages - Mensagens para cada estado
   */
  promise(promise, messages) {
    return toast.promise(promise, messages);
  }
}

// Instância singleton
export const toastManager = new ToastManager();

// Export default para compatibilidade
export default toastManager;