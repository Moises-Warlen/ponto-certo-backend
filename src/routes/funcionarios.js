// C:\Projetos\ponto-certo-backend\src\routes\funcionarios.js
const express = require('express');
const router = express.Router();
const FuncionarioController = require('../controllers/FuncionarioController');
const auth = require('../middleware/auth');
const permissao = require('../middleware/permissao');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');

// Todas as rotas exigem autenticação
router.use(auth);

// Listar (diferentes níveis de acesso)
router.get('/', permissao('visualizarFuncionarios'), FuncionarioController.listar);
router.get('/:id', permissao('visualizarFuncionarios'), FuncionarioController.buscarPorId);

// Cadastrar
router.post(
  '/',
  permissao('cadastrarFuncionario'),
  FuncionarioController.criar
);

// Editar
router.put(
  '/:id',
  permissao('editarFuncionario'),
  FuncionarioController.editar
);

// Alterar status
router.patch(
  '/:id/status',
  permissao('ativarDesativarFuncionario'),
  FuncionarioController.alterarStatus
);

// Excluir
router.delete(
  '/:id',
  permissao('excluirFuncionario'),
  FuncionarioController.excluir
);

// Upload de foto
router.post(
  '/:id/foto',
  permissao('editarFuncionario'),
  uploadSingle('foto'),
  FuncionarioController.uploadFoto
);

// Upload de biometria (múltiplas fotos)
router.post(
  '/:id/biometria',
  permissao('editarFuncionario'),
  uploadMultiple('biometria', 5),
  FuncionarioController.uploadBiometria
);

// Gerar novo PIN
router.post(
  '/:id/novo-pin',
  permissao('editarFuncionario'),
  FuncionarioController.gerarNovoPin
);

module.exports = router;