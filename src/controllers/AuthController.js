// src/controllers/AuthController.js
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

class AuthController {
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      const usuario = await Usuario.findOne({ where: { email } });
      
      if (!usuario || !usuario.verificarSenha(senha)) {
        return res.status(401).json({ erro: 'Email ou senha inválidos' });
      }

      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      const usuarioJSON = usuario.toJSON();
      delete usuarioJSON.senha;

      res.json({ token, usuario: usuarioJSON });

    } catch (error) {
      res.status(500).json({ erro: 'Erro no login' });
    }
  }
}

module.exports = new AuthController();