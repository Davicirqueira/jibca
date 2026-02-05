import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Componente de botão de submit com estados visuais
 */
const FormSubmitButton = ({
  children,
  isLoading = false,
  isValid = true,
  disabled = false,
  loadingText = 'Salvando...',
  className = '',
  variant = 'primary',
  showRetryHint = false,
  hasErrors = false,
  ...props
}) => {
  const isDisabled = disabled || isLoading || !isValid;

  const getButtonClasses = () => {
    let baseClasses = `
      w-full py-3 px-6 rounded-lg font-medium text-center
      transition-all duration-200 transform
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:cursor-not-allowed disabled:transform-none
      ${className}
    `;

    if (variant === 'primary') {
      if (isDisabled) {
        baseClasses += `
          bg-gray-300 text-gray-500 
          disabled:bg-gray-300 disabled:text-gray-500
        `;
      } else {
        baseClasses += `
          bg-red-900 text-white hover:bg-red-800 
          hover:scale-105 active:scale-95
          focus:ring-red-500 shadow-sm hover:shadow-md
        `;
      }
    } else if (variant === 'secondary') {
      if (isDisabled) {
        baseClasses += `
          bg-gray-100 text-gray-400 border border-gray-200
          disabled:bg-gray-100 disabled:text-gray-400
        `;
      } else {
        baseClasses += `
          bg-white text-gray-700 border border-gray-300
          hover:bg-gray-50 hover:scale-105 active:scale-95
          focus:ring-gray-500
        `;
      }
    }

    return baseClasses.trim();
  };

  const getStatusMessage = () => {
    if (isLoading) return null;
    if (!isValid && hasErrors) return 'Corrija os erros destacados para continuar';
    if (!isValid) return 'Preencha todos os campos obrigatórios';
    if (showRetryHint) return 'Clique para tentar novamente';
    return null;
  };

  return (
    <div className="form-submit">
      <button
        type="submit"
        disabled={isDisabled}
        className={getButtonClasses()}
        {...props}
      >
        <div className="flex items-center justify-center space-x-2">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{isLoading ? loadingText : children}</span>
        </div>
      </button>
      
      {/* Mensagem de status */}
      {getStatusMessage() && (
        <p className={`text-sm text-center mt-2 ${
          showRetryHint ? 'text-blue-600' : 
          hasErrors ? 'text-red-600' : 'text-gray-500'
        }`}>
          {getStatusMessage()}
        </p>
      )}
    </div>
  );
};

export default FormSubmitButton;