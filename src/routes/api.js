// C:\Projetos\ponto-certo-backend\src\routes\api.js
const express = require('express');
const router = express.Router();

// Importar rotas
const authRoutes = require('./auth');
const empresaRoutes = require('./empresas');
const funcionarioRoutes = require('./funcionarios');
const pontoRoutes = require('./ponto');
const relatorioRoutes = require('./relatorios');
const adminRoutes = require('./admin');

// Rotas públicas
router.use('/auth', authRoutes);

// Rotas protegidas (a autenticação será aplicada nos arquivos de rota)
router.use('/empresas', empresaRoutes);
router.use('/funcionarios', funcionarioRoutes);
router.use('/ponto', pontoRoutes);
router.use('/relatorios', relatorioRoutes);
router.use('/admin', adminRoutes);

// Rota de saúde
router.get('/health', (req, res) => {
  res.json({
    sucesso: true,
    status: 'OK',
    timestamp: new Date(),
    ambiente: process.env.NODE_ENV,
    versao: '1.0.0'
  });
});

module.exports = router;