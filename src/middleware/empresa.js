// C:\Projetos\ponto-certo-backend\src\middleware\empresa.js
const { Empresa } = require('../models');

module.exports = async (req, res, next) => {
  try {
    const empresaId = req.params.empresaId || req.body.empresaId;

    if (!empresaId) {
      return res.status(400).json({
        sucesso: false,
        erro: 'ID da empresa não fornecido'
      });
    }

    // MASTER pode acessar qualquer empresa
    if (req.usuario.tipo === 'MASTER') {
      const empresa = await Empresa.findByPk(empresaId);
      if (!empresa) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Empresa não encontrada'
        });
      }
      req.empresa = empresa;
      return next();
    }

    // Verificar se usuário pertence à empresa
    if (req.usuario.empresaId !== empresaId) {
      return res.status(403).json({
        sucesso: false,
        erro: 'Acesso negado a esta empresa'
      });
    }

    next();

  } catch (error) {
    console.error('Erro no middleware de empresa:', error);
    return res.status(500).json({
      sucesso: false,
      erro: 'Erro ao verificar empresa'
    });
  }
};