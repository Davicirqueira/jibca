// Utilitários de validação corporativa para formulários

/**
 * Sanitiza entrada do usuário removendo caracteres perigosos
 * @param {string} input - Entrada do usuário
 * @returns {string} - Entrada sanitizada
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]*>/g, '') // Remove tags HTML
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
}

/**
 * Valida formato de email
 * @param {string} email - Email para validar
 * @returns {boolean} - True se válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida força da senha
 * @param {string} password - Senha para validar
 * @returns {object} - Objeto com isValid e critérios
 */
export const validatePasswordStrength = (password) => {
  const criteria = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
  
  const score = Object.values(criteria).filter(Boolean).length
  
  return {
    isValid: score >= 3 && criteria.minLength,
    score,
    criteria,
    strength: score <= 2 ? 'weak' : score <= 3 ? 'medium' : 'strong'
  }
}

/**
 * Valida formato de telefone brasileiro
 * @param {string} phone - Telefone para validar
 * @returns {boolean} - True se válido
 */
export const isValidBrazilianPhone = (phone) => {
  const phoneRegex = /^(?:\+55\s?)?(?:\(?[1-9]{2}\)?\s?)?(?:9\s?)?[0-9]{4}[-\s]?[0-9]{4}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Valida nome completo
 * @param {string} name - Nome para validar
 * @returns {object} - Resultado da validação
 */
export const validateName = (name) => {
  const sanitized = sanitizeInput(name)
  const errors = []
  
  if (!sanitized) {
    errors.push('Nome é obrigatório')
  } else {
    if (sanitized.length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres')
    }
    if (sanitized.length > 100) {
      errors.push('Nome deve ter no máximo 100 caracteres')
    }
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(sanitized)) {
      errors.push('Nome deve conter apenas letras e espaços')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  }
}

/**
 * Valida email
 * @param {string} email - Email para validar
 * @returns {object} - Resultado da validação
 */
export const validateEmail = (email) => {
  const sanitized = sanitizeInput(email).toLowerCase()
  const errors = []
  
  if (!sanitized) {
    errors.push('Email é obrigatório')
  } else {
    if (!isValidEmail(sanitized)) {
      errors.push('Email deve ter um formato válido')
    }
    if (sanitized.length > 255) {
      errors.push('Email deve ter no máximo 255 caracteres')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  }
}

/**
 * Valida telefone
 * @param {string} phone - Telefone para validar
 * @param {boolean} required - Se é obrigatório
 * @returns {object} - Resultado da validação
 */
export const validatePhone = (phone, required = false) => {
  const sanitized = sanitizeInput(phone)
  const errors = []
  
  if (required && !sanitized) {
    errors.push('Telefone é obrigatório')
  } else if (sanitized) {
    if (sanitized.length > 20) {
      errors.push('Telefone deve ter no máximo 20 caracteres')
    }
    if (!/^[\d\s\(\)\-\+]+$/.test(sanitized)) {
      errors.push('Telefone deve conter apenas números e símbolos válidos')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  }
}

/**
 * Valida senha
 * @param {string} password - Senha para validar
 * @param {boolean} required - Se é obrigatória
 * @returns {object} - Resultado da validação
 */
export const validatePassword = (password, required = true) => {
  const errors = []
  
  if (required && !password) {
    errors.push('Senha é obrigatória')
  } else if (password) {
    if (password.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres')
    }
    if (password.length > 50) {
      errors.push('Senha deve ter no máximo 50 caracteres')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: password ? validatePasswordStrength(password) : null
  }
}

/**
 * Valida título de evento
 * @param {string} title - Título para validar
 * @returns {object} - Resultado da validação
 */
export const validateEventTitle = (title) => {
  const sanitized = sanitizeInput(title)
  const errors = []
  
  if (!sanitized) {
    errors.push('Título é obrigatório')
  } else {
    if (sanitized.length < 3) {
      errors.push('Título deve ter pelo menos 3 caracteres')
    }
    if (sanitized.length > 100) {
      errors.push('Título deve ter no máximo 100 caracteres')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  }
}

/**
 * Valida descrição de evento
 * @param {string} description - Descrição para validar
 * @returns {object} - Resultado da validação
 */
export const validateEventDescription = (description) => {
  const sanitized = sanitizeInput(description)
  const errors = []
  
  if (!sanitized) {
    errors.push('Descrição é obrigatória')
  } else {
    if (sanitized.length < 10) {
      errors.push('Descrição deve ter pelo menos 10 caracteres')
    }
    if (sanitized.length > 500) {
      errors.push('Descrição deve ter no máximo 500 caracteres')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  }
}

/**
 * Valida data de evento
 * @param {string} date - Data para validar
 * @returns {object} - Resultado da validação
 */
export const validateEventDate = (date) => {
  const errors = []
  
  if (!date) {
    errors.push('Data é obrigatória')
  } else {
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      errors.push('Data não pode ser no passado')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valida horário de evento
 * @param {string} time - Horário para validar
 * @returns {object} - Resultado da validação
 */
export const validateEventTime = (time) => {
  const errors = []
  
  if (!time) {
    errors.push('Horário é obrigatório')
  } else {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(time)) {
      errors.push('Formato de horário inválido (HH:MM)')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valida local de evento
 * @param {string} location - Local para validar
 * @returns {object} - Resultado da validação
 */
export const validateEventLocation = (location) => {
  const sanitized = sanitizeInput(location)
  const errors = []
  
  if (!sanitized) {
    errors.push('Local é obrigatório')
  } else {
    if (sanitized.length < 3) {
      errors.push('Local deve ter pelo menos 3 caracteres')
    }
    if (sanitized.length > 100) {
      errors.push('Local deve ter no máximo 100 caracteres')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  }
}

/**
 * Valida formulário completo de evento
 * @param {object} formData - Dados do formulário
 * @returns {object} - Resultado da validação
 */
export const validateEventForm = (formData) => {
  const validations = {
    title: validateEventTitle(formData.title),
    description: validateEventDescription(formData.description),
    date: validateEventDate(formData.date),
    time: validateEventTime(formData.time),
    location: validateEventLocation(formData.location)
  }
  
  const errors = {}
  const sanitizedData = {}
  
  Object.keys(validations).forEach(field => {
    const validation = validations[field]
    if (!validation.isValid) {
      errors[field] = validation.errors[0] // Primeiro erro
    }
    if (validation.sanitized !== undefined) {
      sanitizedData[field] = validation.sanitized
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  }
}

/**
 * Valida formulário completo de membro
 * @param {object} formData - Dados do formulário
 * @param {boolean} isEdit - Se é edição (senha opcional)
 * @returns {object} - Resultado da validação
 */
export const validateMemberForm = (formData, isEdit = false) => {
  const validations = {
    name: validateName(formData.name),
    email: validateEmail(formData.email),
    phone: validatePhone(formData.phone, false),
    password: validatePassword(formData.password, !isEdit)
  }
  
  const errors = {}
  const sanitizedData = {}
  
  Object.keys(validations).forEach(field => {
    const validation = validations[field]
    if (!validation.isValid) {
      errors[field] = validation.errors[0] // Primeiro erro
    }
    if (validation.sanitized !== undefined) {
      sanitizedData[field] = validation.sanitized
    }
  })
  
  // Validar role
  if (!formData.role || !['member', 'leader'].includes(formData.role)) {
    errors.role = 'Função é obrigatória'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  }
}

/**
 * Debounce para validação em tempo real
 * @param {function} func - Função para executar
 * @param {number} delay - Delay em ms
 * @returns {function} - Função com debounce
 */
export const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

/**
 * Gera senha segura
 * @param {number} length - Comprimento da senha
 * @returns {string} - Senha gerada
 */
export const generateSecurePassword = (length = 12) => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'
  
  const allChars = uppercase + lowercase + numbers + symbols
  let password = ''
  
  // Garantir pelo menos um de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Preencher o resto
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Embaralhar
  return password.split('').sort(() => Math.random() - 0.5).join('')
}