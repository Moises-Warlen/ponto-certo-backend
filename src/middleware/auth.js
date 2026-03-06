// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const usuario = await Usuario.findByPk(decoded.id);
    
    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ erro: 'Usuário não autorizado' });
    }

    req.usuario = usuario;
    next();
    
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};