// C:\Projetos\ponto-certo-backend\src\middleware\auth.js
const jwt = require('jsonwebtoken');
const { Usuario, Empresa } = require('../models');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        sucesso: false,
        erro: 'Token não fornecido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findByPk(decoded.id, {
      include: ['Empresa']
    });

    if (!usuario) {
      return res.status(401).json({
        sucesso: false,
        erro: 'Usuário não encontrado'
      });
    }

    if (!usuario.ativo) {
      return res.status(401).json({
        sucesso: false,
        erro: 'Usuário inativo'
      });
    }

    if (usuario.estaBloqueado()) {
      return res.status(401).json({
        sucesso: false,
        erro: 'Usuário bloqueado',
        desbloqueio: usuario.bloqueadoAte
      });
    }

    // Verificar empresa (exceto MASTER)
    if (usuario.tipo !== 'MASTER') {
      const empresa = usuario.Empresa;

      if (!empresa) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não encontrada'
        });
      }

      // Verificar status da empresa
      if (!empresa.estaAtiva()) {
        return res.status(403).json({
          sucesso: false,
          erro: 'Empresa inativa',
          status: empresa.status
        });
      }

      // Verificar período de teste
      if (!empresa.verificarTeste()) {
        return res.status(403).json({
          sucesso: false,
          erro: 'Período de teste expirado'
        });
      }

      req.empresa = empresa;
    }

    req.usuario = usuario;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        sucesso: false,
        erro: 'Token inválido'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        sucesso: false,
        erro: 'Token expirado'
      });
    }

    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      sucesso: false,
      erro: 'Erro na autenticação'
    });
  }
};