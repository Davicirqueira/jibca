import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useCallback } from 'react';
import { toastManager } from '../utils/ToastManager';

/**
 * Hook personalizado para gerenciar formulários com validação
 * @param {object} schema - Schema de validação Zod
 * @param {object} options - Opções adicionais
 */
export const useFormValidation = (schema, options = {}) => {
  const {
    defaultValues = {},
    mode = 'onBlur', // Validação em tempo real ao sair do campo
    reValidateMode = 'onChange',
    onSubmitSuccess,
    onSubmitError,
    showToastOnError = true,
    ...formOptions
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode,
    reValidateMode,
    ...formOptions
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, touchedFields },
    setError,
    clearErrors,
    reset,
    watch,
    setValue,
    getValues
  } = form;

  /**
   * Verifica se um campo específico é válido
   */
  const isFieldValid = useCallback((fieldName) => {
    const fieldValue = watch(fieldName);
    const hasError = !!errors[fieldName];
    const isTouched = !!touchedFields[fieldName];
    const hasValue = fieldValue !== undefined && fieldValue !== '' && fieldValue !== null;
    
    return isTouched && hasValue && !hasError;
  }, [errors, touchedFields, watch]);

  /**
   * Mapeia erros do backend para campos do formulário
   */
  const mapBackendErrors = useCallback((backendErrors) => {
    if (!backendErrors || typeof backendErrors !== 'object') return;

    Object.entries(backendErrors).forEach(([field, messages]) => {
      const errorMessage = Array.isArray(messages) ? messages[0] : messages;
      setError(field, {
        type: 'server',
        message: errorMessage
      });
    });
  }, [setError]);

  /**
   * Wrapper para onSubmit com tratamento de erros
   */
  const createSubmitHandler = useCallback((onSubmit) => {
    return handleSubmit(async (data) => {
      setIsSubmitting(true);
      clearErrors();

      try {
        const result = await onSubmit(data);
        
        if (onSubmitSuccess) {
          onSubmitSuccess(result, data);
        }
        
        return result;
      } catch (error) {
        console.error('Erro no formulário:', error);

        // Mapear erros específicos do backend
        if (error.response?.data?.error?.details) {
          mapBackendErrors(error.response.data.error.details);
        } else if (error.response?.data?.errors) {
          mapBackendErrors(error.response.data.errors);
        }

        // Mostrar toast de erro se habilitado com mensagens mais claras
        if (showToastOnError) {
          let errorMessage = 'Erro ao processar formulário';
          
          if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            errorMessage = 'Tempo limite excedido. Verifique sua conexão e tente novamente.';
          } else if (error.response?.status === 400) {
            errorMessage = error.response?.data?.error?.message || 'Dados inválidos. Verifique os campos e tente novamente.';
          } else if (error.response?.status === 401) {
            errorMessage = 'Sessão expirada. Faça login novamente.';
          } else if (error.response?.status === 403) {
            errorMessage = 'Acesso negado. Você não tem permissão para esta ação.';
          } else if (error.response?.status === 404) {
            errorMessage = 'Recurso não encontrado. Recarregue a página e tente novamente.';
          } else if (error.response?.status >= 500) {
            errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.';
          } else if (!navigator.onLine) {
            errorMessage = 'Sem conexão com a internet. Verifique sua conexão e tente novamente.';
          } else {
            errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          'Erro inesperado. Tente novamente.';
          }
          
          toastManager.error(errorMessage);
        }

        if (onSubmitError) {
          onSubmitError(error, data);
        }

        throw error;
      } finally {
        setIsSubmitting(false);
      }
    });
  }, [handleSubmit, clearErrors, mapBackendErrors, onSubmitSuccess, onSubmitError, showToastOnError]);

  /**
   * Reseta o formulário com novos valores
   */
  const resetForm = useCallback((newValues = defaultValues) => {
    reset(newValues);
    clearErrors();
    setIsSubmitting(false);
  }, [reset, clearErrors, defaultValues]);

  /**
   * Valida um campo específico
   */
  const validateField = useCallback(async (fieldName) => {
    try {
      const fieldValue = getValues(fieldName);
      const fieldSchema = schema.shape[fieldName];
      
      if (fieldSchema) {
        await fieldSchema.parseAsync(fieldValue);
        clearErrors(fieldName);
        return true;
      }
    } catch (error) {
      if (error.errors?.[0]) {
        setError(fieldName, {
          type: 'validation',
          message: error.errors[0].message
        });
      }
      return false;
    }
  }, [schema, getValues, setError, clearErrors]);

  /**
   * Obtém estatísticas do formulário
   */
  const getFormStats = useCallback(() => {
    const totalFields = Object.keys(schema.shape).length;
    const touchedCount = Object.keys(touchedFields).length;
    const errorCount = Object.keys(errors).length;
    const validCount = touchedCount - errorCount;

    return {
      totalFields,
      touchedCount,
      errorCount,
      validCount,
      completionPercentage: Math.round((validCount / totalFields) * 100)
    };
  }, [schema, touchedFields, errors]);

  return {
    // Métodos do react-hook-form
    register,
    handleSubmit: createSubmitHandler,
    formState: { errors, isValid, isDirty, touchedFields },
    setError,
    clearErrors,
    reset: resetForm,
    watch,
    setValue,
    getValues,
    
    // Métodos personalizados
    isFieldValid,
    mapBackendErrors,
    validateField,
    getFormStats,
    
    // Estados
    isSubmitting,
    
    // Utilitários
    createSubmitHandler
  };
};

export default useFormValidation;