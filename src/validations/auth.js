// C:\Projetos\ponto-certo-backend\src\validations\auth.js
const { celebrate, Segments, Joi } = require('celebrate');

const login = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().required().email(),
    senha: Joi.string().required().min(6),
    codigo2FA: Joi.string().length(6).pattern(/^\d+$/)
  })
});

const recuperarSenha = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().required().email()
  })
});

const redefinirSenha = celebrate({
  [Segments.BODY]: Joi.object().keys({
    token: Joi.string().required(),
    novaSenha: Joi.string().required().min(6).max(50)
  })
});

const ativar2FA = celebrate({
  [Segments.BODY]: Joi.object().keys({
    segredo: Joi.string().required(),
    codigo: Joi.string().required().length(6).pattern(/^\d+$/)
  })
});

module.exports = {
  login,
  recuperarSenha,
  redefinirSenha,
  ativar2FA
};