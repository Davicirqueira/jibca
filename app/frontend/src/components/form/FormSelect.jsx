import React from 'react';
import { Check, X, AlertCircle, ChevronDown } from 'lucide-react';

/**
 * Componente de select com validação visual
 */
const FormSelect = ({
  label,
  name,
  placeholder = 'Selecione uma opção',
  options = [],
  register,
  error,
  isValid,
  required = false,
  disabled = false,
  valueAsNumber = false,
  className = '',
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

  const getSelectClasses = () => {
    let classes = `
      w-full px-4 py-3 pr-12 border rounded-lg appearance-none
      focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
      transition-all duration-200 cursor-pointer
      ${className}
    `;

    if (disabled) {
      classes += ' bg-gray-100 text-gray-500 cursor-not-allowed';
    } else if (error) {
      classes += ' border-red-300 bg-red-50 text-red-900';
    } else if (isValid) {
      classes += ' border-green-300 bg-green-50 text-green-900';
    } else {
      classes += ' border-gray-300 bg-white text-gray-900';
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
        <select
          disabled={disabled}
          className={getSelectClasses()}
          {...register(name, { valueAsNumber })}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Ícones */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <div className="flex items-center space-x-1">
            {getValidationIcon()}
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
      
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

export default FormSelect;