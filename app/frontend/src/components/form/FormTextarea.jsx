import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

/**
 * Componente de textarea com validação visual
 */
const FormTextarea = ({
  label,
  name,
  placeholder,
  rows = 4,
  register,
  error,
  isValid,
  required = false,
  disabled = false,
  className = '',
  maxLength,
  ...props
}) => {
  const getValidationIcon = () => {
    if (disabled) return null;
    
    if (error) {
      return <X className="w-5 h-5 text-red-500" />;
    }
    
    if (isValid) {
      return <Check className="w-5 h-5 text-green-500" />;
    }
    
    return null;
  };

  const getTextareaClasses = () => {
    let classes = `
      w-full px-4 py-3 border rounded-lg resize-vertical
      focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
      transition-all duration-200
      ${className}
    `;

    if (disabled) {
      classes += ' bg-gray-100 text-gray-500 cursor-not-allowed';
    } else if (error) {
      classes += ' border-red-300 bg-red-50 text-red-900 placeholder-red-400';
    } else if (isValid) {
      classes += ' border-green-300 bg-green-50 text-green-900';
    } else {
      classes += ' border-gray-300 bg-white text-gray-900 placeholder-gray-400';
    }

    return classes.trim();
  };

  return (
    <div className="form-field">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={getTextareaClasses()}
          {...register(name)}
          {...props}
        />
        
        {/* Ícone de validação */}
        <div className="absolute top-3 right-3 pointer-events-none">
          {getValidationIcon()}
        </div>
      </div>
      
      {/* Contador de caracteres */}
      {maxLength && (
        <div className="text-right text-xs text-gray-500 mt-1">
          {props.value?.length || 0}/{maxLength}
        </div>
      )}
      
      {/* Mensagem de erro */}
      {error && (
        <div className="form-error">
          <AlertCircle className="w-4 h-4 text-red-500 mr-1 flex-shrink-0" />
          <span className="text-sm text-red-600">{error.message}</span>
        </div>
      )}
    </div>
  );
};

export default FormTextarea;