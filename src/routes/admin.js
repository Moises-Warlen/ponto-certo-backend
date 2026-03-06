// C:\Projetos\ponto-certo-backend\src\routes\admin.js
const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');
const auth = require('../middleware/auth');
const permissao = require('../middleware/permissao');

// Todas as rotas exigem autenticação
router.use(auth);

// Gerenciar usuários
router.get(
  '/usuarios',
  permissao('gerenciarUsuarios'),
  UsuarioController.listar
);

router.post(
  '/usuarios',
  permissao('gerenciarUsuarios'),
  UsuarioController.criar
);

router.put(
  '/usuarios/:id',
  permissao('gerenciarUsuarios'),
  UsuarioController.editar
);

router.put(
  '/usuarios/:id/permissoes',
  permissao('gerenciarPermissoes'),
  UsuarioController.alterarPermissoes
);

router.delete(
  '/usuarios/:id',
  permissao('gerenciarUsuarios'),
  UsuarioController.excluir
);

// Dashboard administrativo
router.get(
  '/dashboard',
  permissao('visualizarFinanceiro'),
  UsuarioController.dashboardAdmin
);

module.exports = router;