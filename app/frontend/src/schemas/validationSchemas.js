import { z } from 'zod';

/**
 * Schemas de validação para formulários
 * Alinhados com as regras do backend
 */

// Schema para criação/edição de eventos
export const eventSchema = z.object({
  title: z.string()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres')
    .trim(),
  
  description: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  event_type_id: z.number({
    required_error: 'Selecione um tipo de evento',
    invalid_type_error: 'Tipo de evento inválido'
  }).min(1, 'Selecione um tipo de evento'),
  
  date: z.string()
    .min(1, 'Data é obrigatória')
    .refine((dateStr) => {
      const date = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, 'Data não pode ser no passado'),
  
  time: z.string()
    .min(1, 'Horário é obrigatório')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato deve ser HH:MM'),
  
  location: z.string()
    .max(200, 'Local deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal('')),
  
  duration_minutes: z.number()
    .min(15, 'Duração mínima é 15 minutos')
    .max(480, 'Duração máxima é 8 horas')
    .optional()
    .or(z.literal(''))
});

// Schema para criação/edição de membros
export const memberSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Email deve ter um formato válido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .toLowerCase(),
  
  phone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato deve ser (XX) XXXXX-XXXX')
    .optional()
    .or(z.literal('')),
  
  birth_date: z.string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine((dateStr) => {
      const date = new Date(dateStr);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      return age >= 10 && age <= 100;
    }, 'Idade deve estar entre 10 e 100 anos'),
  
  role: z.enum(['member', 'leader'], {
    required_error: 'Selecione um papel',
    invalid_type_error: 'Papel inválido'
  }),
  
  address: z.string()
    .max(300, 'Endereço deve ter no máximo 300 caracteres')
    .optional()
    .or(z.literal('')),
  
  emergency_contact: z.string()
    .max(200, 'Contato de emergência deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal(''))
});

// Schema para perfil do usuário
export const profileSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Email deve ter um formato válido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .toLowerCase(),
  
  phone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato deve ser (XX) XXXXX-XXXX')
    .optional()
    .or(z.literal('')),
  
  birth_date: z.string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine((dateStr) => {
      const date = new Date(dateStr);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      return age >= 10 && age <= 100;
    }, 'Idade deve estar entre 10 e 100 anos'),
  
  address: z.string()
    .max(300, 'Endereço deve ter no máximo 300 caracteres')
    .optional()
    .or(z.literal('')),
  
  emergency_contact: z.string()
    .max(200, 'Contato de emergência deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal(''))
});

// Schema para login
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Email deve ter um formato válido')
    .toLowerCase(),
  
  password: z.string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
});

// Schema para alteração de senha
export const passwordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Senha atual é obrigatória'),
  
  newPassword: z.string()
    .min(6, 'Nova senha deve ter no mínimo 6 caracteres')
    .max(100, 'Nova senha deve ter no máximo 100 caracteres'),
  
  confirmPassword: z.string()
    .min(1, 'Confirmação de senha é obrigatória')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
});