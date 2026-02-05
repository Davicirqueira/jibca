/**
 * Utilitários de validação
 */

/**
 * Validar se uma string é um UUID v4 válido
 * @param {string} uuid - String para validar
 * @returns {boolean} True se é um UUID válido
 */
function isValidUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validar UUID e lançar erro se inválido
 * @param {string} uuid - UUID para validar
 * @param {string} fieldName - Nome do campo (para mensagem de erro)
 * @throws {Error} Se UUID for inválido
 */
function validateUUID(uuid, fieldName = 'ID') {
  if (!isValidUUID(uuid)) {
    throw new Error(`${fieldName} inválido`);
  }
}

/**
 * Validar se um valor é um inteiro positivo
 * @param {any} value - Valor para validar
 * @returns {boolean} True se é um inteiro positivo
 */
function isPositiveInteger(value) {
  const num = parseInt(value);
  return !isNaN(num) && num > 0 && num === parseFloat(value);
}

/**
 * Validar email
 * @param {string} email - Email para validar
 * @returns {boolean} True se é um email válido
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validar telefone brasileiro
 * @param {string} phone - Telefone para validar
 * @returns {boolean} True se é um telefone válido
 */
function isValidBrazilianPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // Aceita formatos: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
  return phoneRegex.test(phone);
}

/**
 * Validar data no formato YYYY-MM-DD
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
  
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
}

/**
 * Validar horário no formato HH:MM
 * @param {string} time - Horário para validar
 * @returns {boolean} True se é um horário válido
 */
function isValidTime(time) {
  if (!time || typeof time !== 'string') {
    return false;
  }
  
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
}

module.exports = {
  isValidUUID,
  validateUUID,
  isPositiveInteger,
  isValidEmail,
  isValidBrazilianPhone,
  isValidDate,
  isValidTime
};
