import { useState, useCallback } from 'react'
import { debounce } from '../utils/validation'

/**
 * Hook personalizado para validação de formulários
 * @param {object} initialValues - Valores iniciais do formulário
 * @param {function} validationSchema - Função de validação
 * @param {object} options - Opções do hook
 * @returns {object} - Estado e funções do formulário
 */
export const useFormValidation = (initialValues, validationSchema, options = {}) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300
  } = options

  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValid, setIsValid] = useState(false)

  // Debounced validation
  const debouncedValidate = useCallback(
    debounce((fieldName, value) => {
      if (validationSchema) {
        const validation = validationSchema({ ...values, [fieldName]: value })
        setErrors(prev => ({
          ...prev,
          [fieldName]: validation.errors[fieldName]
        }))
      }
    }, debounceMs),
    [values, validationSchema, debounceMs]
  )

  // Validate single field
  const validateField = useCallback((fieldName, value) => {
    if (validationSchema) {
      const validation = validationSchema({ ...values, [fieldName]: value })
      setErrors(prev => ({
        ...prev,
        [fieldName]: validation.errors[fieldName]
      }))
      return !validation.errors[fieldName]
    }
    return true
  }, [values, validationSchema])

  // Validate entire form
  const validateForm = useCallback(() => {
    if (validationSchema) {
      const validation = validationSchema(values)
      setErrors(validation.errors)
      setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
      setIsValid(validation.isValid)
      return validation.isValid
    }
    return true
  }, [values, validationSchema])

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value

    setValues(prev => ({ ...prev, [name]: newValue }))

    if (validateOnChange && touched[name]) {
      debouncedValidate(name, newValue)
    }
  }, [validateOnChange, touched, debouncedValidate])

  // Handle input blur
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target

    setTouched(prev => ({ ...prev, [name]: true }))

    if (validateOnBlur) {
      validateField(name, value)
    }
  }, [validateOnBlur, validateField])

  // Handle form submission
  const handleSubmit = useCallback((onSubmit) => {
    return async (e) => {
      e.preventDefault()
      
      if (!validateForm()) {
        return false
      }

      setIsSubmitting(true)
      try {
        await onSubmit(values)
        return true
      } catch (error) {
        console.error('Form submission error:', error)
        return false
      } finally {
        setIsSubmitting(false)
      }
    }
  }, [values, validateForm])

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
    setIsValid(false)
  }, [initialValues])

  // Set field value programmatically
  const setFieldValue = useCallback((fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }))
    
    if (touched[fieldName] && validateOnChange) {
      debouncedValidate(fieldName, value)
    }
  }, [touched, validateOnChange, debouncedValidate])

  // Set field error programmatically
  const setFieldError = useCallback((fieldName, error) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }))
  }, [])

  // Get field props for easy integration
  const getFieldProps = useCallback((fieldName) => {
    return {
      name: fieldName,
      value: values[fieldName] || '',
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[fieldName] && errors[fieldName],
      isValid: touched[fieldName] && !errors[fieldName] && values[fieldName]
    }
  }, [values, errors, touched, handleChange, handleBlur])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
    validateForm,
    resetForm,
    setFieldValue,
    setFieldError,
    getFieldProps
  }
}