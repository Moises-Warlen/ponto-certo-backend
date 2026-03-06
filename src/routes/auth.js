// C:\Projetos\ponto-certo-backend\src\routes\auth.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

// Rotas públicas (com limite de tentativas)
router.post('/login', authLimiter, AuthController.login);
router.post('/recuperar-senha', authLimiter, AuthController.recuperarSenha);
router.post('/redefinir-senha', authLimiter, AuthController.redefinirSenha);

// Rotas protegidas
router.post('/ativar-2fa', auth, AuthController.ativar2FA);
router.post('/verificar-2fa', auth, AuthController.verificarEAtivar2FA);

module.exports = router;