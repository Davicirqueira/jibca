/**
 * Utilitários de validação aprimorados
 */

/**
 * Validar se uma string é um UUID v4 válido
 * @param {string} uuid - String para validar
 * @returns {boolean} True se é um UUID v4 válido
 */
function isValidUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  
  // Verificar formato básico primeiro (performance)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    return false;
  }
  
  // Validação adicional: verificar se é especificamente v4
  const version = uuid.charAt(14);
  const variant = uuid.charAt(19);
  
  return version === '4' && ['8', '9', 'a', 'b', 'A', 'B'].includes(variant);
}

/**
 * Validar UUID e lançar erro se inválido
 * @param {string} uuid - UUID para validar
 * @param {string} fieldName - Nome do campo (para mensagem de erro)
 * @throws {Error} Se UUID for inválido
 */
function validateUUID(uuid, fieldName = 'ID') {
  if (!isValidUUID(uuid)) {
    throw new Error(`${fieldName} deve ser um UUID v4 válido`);
  }
}

/**
 * Validar se um valor é um inteiro positivo
 * @param {any} value - Valor para validar
 * @returns {boolean} True se é um inteiro positivo
 */
function isPositiveInteger(value) {
  const num = parseInt(value);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
}

/**
 * Validar se um valor é um inteiro não-negativo (incluindo 0)
 * @param {any} value - Valor para validar
 * @returns {boolean} True se é um inteiro não-negativo
 */
function isNonNegativeInteger(value) {
  const num = parseInt(value);
  return !isNaN(num) && num >= 0 && Number.isInteger(num);
}

/**
 * Sanitizar e validar ID numérico
 * @param {any} id - ID para validar
 * @param {string} fieldName - Nome do campo
 * @returns {number} ID validado
 * @throws {Error} Se ID for inválido
 */
function validateNumericId(id, fieldName = 'ID') {
  const numId = parseInt(id);
  
  if (isNaN(numId) || numId <= 0 || !Number.isInteger(numId)) {
    throw new Error(`${fieldName} deve ser um número inteiro positivo`);
  }
  
  // Verificar se não é muito grande (evitar overflow)
  if (numId > Number.MAX_SAFE_INTEGER) {
    throw new Error(`${fieldName} é muito grande`);
  }
  
  return numId;
}

/**
 * Validar email com regras mais rigorosas
 * @param {string} email - Email para validar
 * @returns {boolean} True se é um email válido
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Verificar tamanho
  if (email.length > 254) {
    return false;
  }
  
  // Regex mais rigoroso para email
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Verificar se não tem pontos consecutivos
  if (email.includes('..')) {
    return false;
  }
  
  // Verificar partes do email
  const [localPart, domain] = email.split('@');
  
  // Local part não pode ter mais de 64 caracteres
  if (localPart.length > 64) {
    return false;
  }
  
  // Domain não pode começar ou terminar com hífen
  if (domain.startsWith('-') || domain.endsWith('-')) {
    return false;
  }
  
  return true;
}

/**
 * Validar telefone brasileiro com formatos flexíveis
 * @param {string} phone - Telefone para validar
 * @returns {boolean} True se é um telefone válido
 */
function isValidBrazilianPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // Remover todos os caracteres não numéricos para validação
  const numbersOnly = phone.replace(/\D/g, '');
  
  // Aceitar telefones com 10 ou 11 dígitos (com ou sem DDD)
  if (numbersOnly.length < 10 || numbersOnly.length > 11) {
    return false;
  }
  
  // Se tem 11 dígitos, o terceiro deve ser 9 (celular)
  if (numbersOnly.length === 11 && numbersOnly.charAt(2) !== '9') {
    return false;
  }
  
  // Verificar se DDD é válido (11-99)
  const ddd = parseInt(numbersOnly.substring(0, 2));
  if (ddd < 11 || ddd > 99) {
    return false;
  }
  
  return true;
}

/**
 * Validar data no formato YYYY-MM-DD com verificações adicionais
 * @param {string} date - Data para validar
 * @returns {boolean} True se é uma data válida
 */
function isValidDate(date) {
  if (!date || typeof date !== 'string') {
    return false;
  }
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }
  
  const dateObj = new Date(date + 'T00:00:00.000Z');
  
  // Verificar se a data é válida
  if (isNaN(dateObj.getTime())) {
    return false;
  }
  
  // Verificar se a data não mudou após parsing (ex: 2023-02-30 vira 2023-03-02)
  const [year, month, day] = date.split('-').map(Number);
  return dateObj.getUTCFullYear() === year && 
         dateObj.getUTCMonth() === month - 1 && 
         dateObj.getUTCDate() === day;
}

/**
 * Validar horário no formato HH:MM com verificações adicionais
 * @param {string} time - Horário para validar
 * @returns {boolean} True se é um horário válido
 */
function isValidTime(time) {
  if (!time || typeof time !== 'string') {
    return false;
  }
  
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(time)) {
    return false;
  }
  
  const [hours, minutes] = time.split(':').map(Number);
  
  // Verificação adicional (redundante mas segura)
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

/**
 * Validar senha com critérios de segurança
 * @param {string} password - Senha para validar
 * @returns {object} Resultado da validação com detalhes
 */
function validatePassword(password) {
  const result = {
    isValid: false,
    errors: [],
    strength: 'weak'
  };
  
  if (!password || typeof password !== 'string') {
    result.errors.push('Senha é obrigatória');
    return result;
  }
  
  // Verificar tamanho mínimo
  if (password.length < 6) {
    result.errors.push('Senha deve ter pelo menos 6 caracteres');
  }
  
  // Verificar tamanho máximo
  if (password.length > 128) {
    result.errors.push('Senha deve ter no máximo 128 caracteres');
  }
  
  // Verificar se não é muito simples
  const commonPasswords = ['123456', 'password', '123456789', 'qwerty', 'abc123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    result.errors.push('Senha muito comum, escolha uma mais segura');
  }
  
  // Calcular força da senha
  let strengthScore = 0;
  
  if (password.length >= 8) strengthScore++;
  if (/[a-z]/.test(password)) strengthScore++;
  if (/[A-Z]/.test(password)) strengthScore++;
  if (/\d/.test(password)) strengthScore++;
  if (/[^a-zA-Z\d]/.test(password)) strengthScore++;
  
  if (strengthScore >= 4) {
    result.strength = 'strong';
  } else if (strengthScore >= 3) {
    result.strength = 'medium';
  }
  
  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Sanitizar string removendo caracteres perigosos
 * @param {string} str - String para sanitizar
 * @param {object} options - Opções de sanitização
 * @returns {string} String sanitizada
 */
function sanitizeString(str, options = {}) {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  const {
    maxLength = 1000,
    allowHtml = false,
    removeExtraSpaces = true
  } = options;
  
  let sanitized = str;
  
  // Remover caracteres de controle
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Remover HTML se não permitido
  if (!allowHtml) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }
  
  // Remover espaços extras
  if (removeExtraSpaces) {
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
  }
  
  // Limitar tamanho
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

module.exports = {
  isValidUUID,
  validateUUID,
  isPositiveInteger,
  isNonNegativeInteger,
  validateNumericId,
  isValidEmail,
  isValidBrazilianPhone,
  isValidDate,
  isValidTime,
  validatePassword,
  sanitizeString
};
