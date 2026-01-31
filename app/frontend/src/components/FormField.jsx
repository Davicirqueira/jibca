import React from 'react'
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  isValid,
  icon: Icon,
  showPassword,
  onTogglePassword,
  options = [],
  rows = 4,
  className = '',
  helpText,
  ...props
}) => {
  const fieldId = `field-${name}`
  
  const getFieldClasses = () => {
    const baseClasses = 'w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2'
    
    if (error) {
      return `${baseClasses} border-red-300 focus:ring-red-500 focus:border-red-500`
    } else if (isValid) {
      return `${baseClasses} border-green-300 focus:ring-green-500 focus:border-green-500`
    } else {
      return `${baseClasses} border-gray-300 focus:ring-blue-500 focus:border-blue-500`
    }
  }

  const renderInput = () => {
    const commonProps = {
      id: fieldId,
      name,
      value,
      onChange,
      onBlur,
      placeholder,
      disabled,
      className: getFieldClasses(),
      ...props
    }

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
            className={`${getFieldClasses()} resize-none`}
          />
        )
      
      case 'select':
        return (
          <select {...commonProps}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      
      case 'password':
        return (
          <div className="relative">
            <input
              {...commonProps}
              type={showPassword ? 'text' : 'password'}
              className={`${getFieldClasses()} pr-12`}
            />
            {onTogglePassword && (
              <button
                type="button"
                onClick={onTogglePassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          </div>
        )
      
      default:
        return <input {...commonProps} type={type} />
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label htmlFor={fieldId} className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
        {Icon && <Icon className="w-4 h-4 text-blue-600" />}
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {renderInput()}
        
        {/* Status Icons */}
        {type !== 'password' && (
          <>
            {isValid && (
              <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
            {error && (
              <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
            )}
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-600 text-sm font-medium flex items-center space-x-1">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </p>
      )}

      {/* Help Text */}
      {helpText && !error && (
        <p className="text-gray-500 text-sm">{helpText}</p>
      )}
    </div>
  )
}

export default FormField