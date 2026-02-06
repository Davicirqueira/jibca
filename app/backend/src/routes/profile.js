const express = require('express');
const { body } = require('express-validator');
const ProfileController = require('../controllers/ProfileController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validações para atualização de perfil
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Nome não pode ser vazio')
    .isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('phone')
    .optional()
    .trim()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) return true; // Permitir limpar telefone
      
      // Remover todos os caracteres não numéricos para validação
      const numbersOnly = value.replace(/\D/g, '');
      
      // Aceitar telefones com 10 ou 11 dígitos (com ou sem DDD)
      if (numbersOnly.length < 10 || numbersOnly.length > 11) {
        throw new Error('Telefone deve ter 10 ou 11 dígitos');
      }
      
      return true;
    })
];

// Validações para atualização de senha
const updatePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword')
    .notEmpty().withMessage('Nova senha é obrigatória')
    .isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres'),
  body('confirmPassword')
    .notEmpty().withMessage('Confirmação de senha é obrigatória')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Senhas não coincidem');
      }
      return true;
    })
];

// Rotas de perfil (usuário logado)
router.get('/', auth, ProfileController.getProfile);
router.put('/', auth, updateProfileValidation, ProfileController.updateProfile);
router.put('/password', auth, updatePasswordValidation, ProfileController.updatePassword);

module.exports = router;
