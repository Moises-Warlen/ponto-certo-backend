// C:\Projetos\ponto-certo-backend\src\routes\ponto.js
const express = require('express');
const router = express.Router();
const PontoController = require('../controllers/PontoController');
const auth = require('../middleware/auth');
const permissao = require('../middleware/permissao');
const { uploadSingle } = require('../middleware/upload');

// Todas as rotas exigem autenticação
router.use(auth);

// Registrar próprio ponto
router.post(
  '/registrar',
  permissao('registrarProprioPonto'),
  uploadSingle('foto'),
  PontoController.registrar
);

// Registrar ponto de outro funcionário
router.post(
  '/registrar-outro',
  permissao('registrarPontoOutros'),
  PontoController.registrarOutro
);

// Meus registros
router.get(
  '/meus-registros',
  permissao('visualizarPropriosRegistros'),
  PontoController.meusRegistros
);

// Registros do departamento
router.get(
  '/departamento',
  permissao('visualizarRegistrosDepartamento'),
  PontoController.registrosDepartamento
);

// Registros gerais
router.get(
  '/geral',
  permissao('visualizarRegistrosGeral'),
  PontoController.registrosGeral
);

// Registros de hoje
router.get('/hoje', PontoController.registrosHoje);

// Enviar comprovante por email
router.post(
  '/:id/enviar-email',
  PontoController.enviarComprovanteEmail
);

module.exports = router;