import { useState, useCallback, useRef, useEffect } from 'react';
import { toastManager } from '../utils/ToastManager';

/**
 * Estados de loading possíveis
 */
export const LoadingState = {
  IDLE: 'idle',
  LOADING: 'loading', 
  SUCCESS: 'success',
  ERROR: 'error',
  EMPTY: 'empty'
};

/**
 * Hook para gerenciar estados de loading robustos com timeout
 * @param {number} timeout - Timeout em milissegundos (padrão: 10000)
 * @returns {object} Estado e funções de controle
 */
export const useRobustLoading = (timeout = 10000) => {
  const [loadingState, setLoadingState] = useState(LoadingState.IDLE);
  const [errorMessage, setErrorMessage] = useState('');
  const [data, setData] = useState(null);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);

  /**
   * Limpa recursos ativos (timeout e abort controller)
   */
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Executa uma operação assíncrona com timeout e controle de abort
   * @param {Function} asyncOperation - Função assíncrona a ser executada
   * @param {object} options - Opções adicionais
   */
  const execute = useCallback(async (asyncOperation, options = {}) => {
    const {
      onSuccess,
      onError,
      onEmpty,
      showToastOnError = true,
      emptyCheck = (result) => Array.isArray(result) && result.length === 0
    } = options;

    // Limpar recursos anteriores
    cleanup();

    // Configurar novo abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Iniciar loading
    setLoadingState(LoadingState.LOADING);
    setErrorMessage('');
    setData(null);

    // Configurar timeout
    timeoutRef.current = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }, timeout);

    try {
      // Executar operação assíncrona
      const result = await asyncOperation(signal);

      // Limpar timeout se operação completou
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Verificar se foi abortado
      if (signal.aborted) {
        throw new Error('ABORTED');
      }

      // Verificar se resultado está vazio
      if (emptyCheck(result)) {
        setLoadingState(LoadingState.EMPTY);
        setData(result);
        onEmpty?.(result);
        return result;
      }

      // Sucesso
      setLoadingState(LoadingState.SUCCESS);
      setData(result);
      onSuccess?.(result);
      return result;

    } catch (error) {
      // Limpar timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Se foi abortado intencionalmente (componente desmontado ou nova requisição), não tratar como erro
      if (error.name === 'AbortError' || error.message === 'ABORTED') {
        console.log('Requisição abortada (timeout ou nova requisição)');
        setLoadingState(LoadingState.IDLE);
        return null;
      }

      let errorMsg = '';

      if (error.response?.status >= 500) {
        errorMsg = 'Erro interno do servidor. Tente novamente.';
      } else if (error.response?.status === 404) {
        errorMsg = 'Recurso não encontrado.';
      } else if (error.response?.data?.error?.message) {
        errorMsg = error.response.data.error.message;
      } else if (error.message) {
        errorMsg = error.message;
      } else {
        errorMsg = 'Erro desconhecido. Tente novamente.';
      }

      setLoadingState(LoadingState.ERROR);
      setErrorMessage(errorMsg);

      // Mostrar toast de erro se habilitado
      if (showToastOnError) {
        toastManager.error(errorMsg);
      }

      onError?.(error, errorMsg);
      throw error;
    }
  }, [timeout, cleanup]);

  /**
   * Redefine o estado para idle
   */
  const reset = useCallback(() => {
    cleanup();
    setLoadingState(LoadingState.IDLE);
    setErrorMessage('');
    setData(null);
  }, [cleanup]);

  /**
   * Força o estado para um valor específico
   */
  const setState = useCallback((state, error = '', newData = null) => {
    setLoadingState(state);
    setErrorMessage(error);
    setData(newData);
  }, []);

  // Cleanup ao desmontar componente
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // Estados
    loadingState,
    isLoading: loadingState === LoadingState.LOADING,
    isSuccess: loadingState === LoadingState.SUCCESS,
    isError: loadingState === LoadingState.ERROR,
    isEmpty: loadingState === LoadingState.EMPTY,
    isIdle: loadingState === LoadingState.IDLE,
    
    // Dados
    data,
    errorMessage,
    
    // Funções
    execute,
    reset,
    setState,
    cleanup
  };
};