// C:\Projetos\ponto-certo-backend\src\middleware\errorHandler.js
const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  // Log do erro
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    usuario: req.usuario?.id
  });

  // Erro de validação (Joi/Celebrate)
  if (err.isJoi) {
    return res.status(400).json({
      sucesso: false,
      erro: 'Erro de validação',
      detalhes: err.details.map(d => ({
        campo: d.path.join('.'),
        mensagem: d.message
      }))
    });
  }

  // Erro de banco de dados (Sequelize)
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      sucesso: false,
      erro: 'Erro de validação',
      detalhes: err.errors.map(e => ({
        campo: e.path,
        mensagem: e.message
      }))
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      sucesso: false,
      erro: 'Registro duplicado',
      detalhes: err.errors.map(e => ({
        campo: e.path,
        mensagem: 'Já existe um registro com este valor'
      }))
    });
  }

  // Erro de autenticação
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      sucesso: false,
      erro: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      sucesso: false,
      erro: 'Token expirado'
    });
  }

  // Erro 404 - Rota não encontrada
  if (err.status === 404) {
    return res.status(404).json({
      sucesso: false,
      erro: 'Rota não encontrada'
    });
  }

  // Erro 429 - Muitas requisições
  if (err.status === 429) {
    return res.status(429).json({
      sucesso: false,
      erro: 'Muitas requisições. Tente novamente mais tarde.'
    });
  }

  // Erro interno do servidor
  console.error('Erro não tratado:', err);

  return res.status(500).json({
    sucesso: false,
    erro: 'Erro interno no servidor',
    mensagem: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};