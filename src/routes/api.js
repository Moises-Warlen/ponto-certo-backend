// src/routes/api.js
const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');

// Rotas públicas
router.post('/auth/login', AuthController.login);

// Rotas protegidas
router.get('/teste', auth, (req, res) => {
  res.json({ mensagem: 'Rota protegida funcionando!' });
});

module.exports = router;