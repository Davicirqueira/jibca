import { useEffect } from 'react';
import { toastManager } from '../utils/ToastManager';

/**
 * Hook para garantir limpeza de toasts quando componente é desmontado
 * @param {boolean} clearOnUnmount - Se deve limpar toasts ao desmontar (padrão: true)
 */
export const useToastCleanup = (clearOnUnmount = true) => {
  useEffect(() => {
    // Cleanup ao desmontar componente
    return () => {
      if (clearOnUnmount) {
        toastManager.clearAll();
      }
    };
  }, [clearOnUnmount]);

  return toastManager;
};

export default useToastCleanup;