const { body, sanitizeBody } = require('express-validator');

/**
 * Middleware para sanitização básica de inputs
 * Remove espaços em branco e escapa caracteres perigosos
 */
const basicSanitization = [
  // Sanitizar todos os campos de texto
  body('*').trim(),
  
  // Sanitizar campos específicos que podem conter HTML
  body(['title', 'description', 'name', 'message']).escape(),
  
  // Normalizar emails
  body('email').normalizeEmail({
    gmail_lowercase: true,
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    outlookdotcom_lowercase: true,
    yahoo_lowercase: true,
    icloud_lowercase: true
  }),
  
  // Sanitizar telefones (manter apenas números e símbolos válidos)
  body('phone').customSanitizer((value) => {
    if (!value) return value;
    // Permitir apenas números, espaços, parênteses, hífens e +
    return value.replace(/[^\d\s\(\)\-\+]/g, '');
  })
];

/**
 * Sanitização avançada para campos que podem conter conteúdo rico
 */
const advancedSanitization = [
  ...basicSanitization,
  
  // Para campos de descrição, permitir algumas tags HTML básicas
  body('description').customSanitizer((value) => {
    if (!value) return value;
    
    // Lista de tags permitidas (básicas e seguras)
    const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'br', 'p'];
    
    // Remover todas as tags exceto as permitidas
    let sanitized = value.replace(/<(?!\/?(?:b|i|u|strong|em|br|p)\b)[^>]*>/gi, '');
    
    // Escapar caracteres especiais em atributos
    sanitized = sanitized.replace(/(<[^>]*)\s+on\w+="[^"]*"/gi, '$1');
    
    return sanitized;
  })
];

/**
 * Sanitização específica para busca
 * Remove caracteres que podem causar problemas em queries
 */
const searchSanitization = [
  body('search').customSanitizer((value) => {
    if (!value) return value;
    
    // Remover caracteres especiais que podem causar problemas em SQL
    return value
      .replace(/[%_\\]/g, '') // Remover wildcards SQL
      .replace(/[<>]/g, '') // Remover operadores
      .trim()
      .substring(0, 100); // Limitar tamanho
  }),
  
  body('q').customSanitizer((value) => {
    if (!value) return value;
    return value
      .replace(/[%_\\]/g, '')
      .replace(/[<>]/g, '')
      .trim()
      .substring(0, 100);
  })
];

/**
 * Sanitização para campos numéricos
 */
const numericSanitization = [
  body(['page', 'limit', 'id', 'event_type_id', 'duration_minutes']).toInt(),
  body(['is_active', 'active']).toBoolean()
];

/**
 * Sanitização para datas e horários
 */
const dateTimeSanitization = [
  body('date').customSanitizer((value) => {
    if (!value) return value;
    
    // Validar formato YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      return null; // Será capturado pela validação
    }
    
    return value;
  }),
  
  body('time').customSanitizer((value) => {
    if (!value) return value;
    
    // Validar formato HH:MM
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(value)) {
      return null; // Será capturado pela validação
    }
    
    return value;
  })
];

/**
 * Sanitização para senhas
 * Remove espaços mas mantém caracteres especiais
 */
const passwordSanitization = [
  body(['password', 'newPassword', 'currentPassword', 'confirmPassword'])
    .customSanitizer((value) => {
      if (!value) return value;
      
      // Remover apenas espaços no início e fim
      return value.trim();
    })
];

/**
 * Middleware combinado para formulários de usuário
 */
const userFormSanitization = [
  ...basicSanitization,
  ...numericSanitization,
  ...passwordSanitization
];

/**
 * Middleware combinado para formulários de evento
 */
const eventFormSanitization = [
  ...basicSanitization,
  ...numericSanitization,
  ...dateTimeSanitization,
  ...advancedSanitization
];

/**
 * Middleware para sanitização de parâmetros de query
 */
const queryParamsSanitization = [
  ...searchSanitization,
  ...numericSanitization
];

/**
 * Função utilitária para sanitizar objetos manualmente
 */
const sanitizeObject = (obj) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Sanitização básica para strings
      sanitized[key] = value
        .trim()
        .replace(/[<>]/g, '') // Remover < e >
        .substring(0, 1000); // Limitar tamanho
    } else if (typeof value === 'number') {
      // Validar números
      sanitized[key] = isNaN(value) ? null : value;
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Middleware para log de sanitização (desenvolvimento)
 */
const sanitizationLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    const originalBody = JSON.stringify(req.body);
    
    // Executar após sanitização
    setTimeout(() => {
      const sanitizedBody = JSON.stringify(req.body);
      
      if (originalBody !== sanitizedBody) {
        console.log('🧹 Sanitização aplicada:', {
          route: req.path,
          method: req.method,
          original: originalBody,
          sanitized: sanitizedBody
        });
      }
    }, 0);
  }
  
  next();
};

module.exports = {
  basicSanitization,
  advancedSanitization,
  searchSanitization,
  numericSanitization,
  dateTimeSanitization,
  passwordSanitization,
  userFormSanitization,
  eventFormSanitization,
  queryParamsSanitization,
  sanitizeObject,
  sanitizationLogger
};