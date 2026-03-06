// C:\Projetos\ponto-certo-backend\src\routes\empresas.js
const express = require('express');
const router = express.Router();
const EmpresaController = require('../controllers/EmpresaController');
const auth = require('../middleware/auth');
const permissao = require('../middleware/permissao');
const { uploadSingle } = require('../middleware/upload');

// Todas as rotas de empresa exigem autenticação
router.use(auth);

// Rotas para MASTER apenas
router.get('/', permissao('visualizarFinanceiro'), EmpresaController.listar);
router.get('/:id', permissao('visualizarFinanceiro'), EmpresaController.buscarPorId);
router.post('/', permissao('gerenciarAssinatura'), EmpresaController.criar);
router.put('/:id', permissao('gerenciarAssinatura'), EmpresaController.atualizar);
router.put('/:id/status', permissao('gerenciarAssinatura'), EmpresaController.alterarStatus);
router.delete('/:id', permissao('gerenciarAssinatura'), EmpresaController.excluir);
router.get('/:id/financeiro', permissao('visualizarFinanceiro'), EmpresaController.relatorioFinanceiro);
router.post('/:id/pagamentos', permissao('gerenciarAssinatura'), EmpresaController.registrarPagamento);

// Upload de logo
router.post(
  '/:id/logo',
  permissao('gerenciarAssinatura'),
  uploadSingle('logo'),
  EmpresaController.uploadLogo
);

module.exports = router;