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
      if (value === '' || value === null) return true; // Permitir limpar telefone
      const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
      if (!phoneRegex.test(value)) {
        throw new Error('Telefone inválido (formato: (XX) XXXXX-XXXX)');
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
    .isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Nova senha deve conter letras maiúsculas, minúsculas e números'),
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
