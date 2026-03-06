// C:\Projetos\ponto-certo-backend\src\routes\relatorios.js
const express = require('express');
const router = express.Router();
const RelatorioController = require('../controllers/RelatorioController');
const auth = require('../middleware/auth');
const permissao = require('../middleware/permissao');

// Todas as rotas exigem autenticação
router.use(auth);

// Meu relatório
router.get(
  '/meu',
  permissao('gerarRelatoriosProprios'),
  RelatorioController.meuRelatorio
);

// Relatório do departamento
router.get(
  '/departamento',
  permissao('gerarRelatoriosDepartamento'),
  RelatorioController.relatorioDepartamento
);

// Relatório geral
router.get(
  '/geral',
  permissao('gerarRelatoriosGerais'),
  RelatorioController.relatorioGeral
);

// Exportar relatório
router.get(
  '/exportar',
  permissao('exportarRelatorios'),
  RelatorioController.exportar
);

// Imprimir comprovante
router.get(
  '/imprimir/:id',
  permissao('imprimirRelatorios'),
  RelatorioController.imprimir
);

module.exports = router;