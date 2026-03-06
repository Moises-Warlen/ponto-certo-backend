// C:\Projetos\ponto-certo-backend\src\validations\ponto.js
const { celebrate, Segments, Joi } = require('celebrate');

const registrarPonto = celebrate({
  [Segments.BODY]: Joi.object().keys({
    funcionarioId: Joi.string().uuid(),
    tipo: Joi.string().required().valid('ENTRADA', 'SAIDA', 'INTERVALO', 'RETORNO'),
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
    observacao: Joi.string().max(500)
  })
});

const listarRegistros = celebrate({
  [Segments.QUERY]: Joi.object().keys({
    data: Joi.date(),
    inicio: Joi.date(),
    fim: Joi.date(),
    funcionarioId: Joi.string().uuid(),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100)
  })
});

module.exports = {
  registrarPonto,
  listarRegistros
};