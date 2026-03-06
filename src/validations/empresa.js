// C:\Projetos\ponto-certo-backend\src\validations\empresa.js
const { celebrate, Segments, Joi } = require('celebrate');

const criarEmpresa = celebrate({
  [Segments.BODY]: Joi.object().keys({
    razaoSocial: Joi.string().required().min(3).max(200),
    nomeFantasia: Joi.string().max(200),
    cnpj: Joi.string().required().length(14).pattern(/^\d+$/),
    inscricaoEstadual: Joi.string().max(20),
    inscricaoMunicipal: Joi.string().max(20),
    email: Joi.string().required().email(),
    telefone: Joi.string().max(20),
    celular: Joi.string().max(20),
    site: Joi.string().uri(),
    cep: Joi.string().length(8).pattern(/^\d+$/),
    endereco: Joi.string().max(200),
    numero: Joi.string().max(10),
    complemento: Joi.string().max(100),
    bairro: Joi.string().max(100),
    cidade: Joi.string().max(100),
    estado: Joi.string().length(2),
    plano: Joi.string().valid('BASICO', 'PROFISSIONAL', 'ENTERPRISE'),
    limiteFuncionarios: Joi.number().integer().min(1),
    valorMensal: Joi.number().precision(2).positive(),
    diaVencimento: Joi.number().integer().min(1).max(31)
  })
});

const atualizarEmpresa = celebrate({
  [Segments.BODY]: Joi.object().keys({
    razaoSocial: Joi.string().min(3).max(200),
    nomeFantasia: Joi.string().max(200),
    inscricaoEstadual: Joi.string().max(20),
    inscricaoMunicipal: Joi.string().max(20),
    email: Joi.string().email(),
    telefone: Joi.string().max(20),
    celular: Joi.string().max(20),
    site: Joi.string().uri(),
    cep: Joi.string().length(8).pattern(/^\d+$/),
    endereco: Joi.string().max(200),
    numero: Joi.string().max(10),
    complemento: Joi.string().max(100),
    bairro: Joi.string().max(100),
    cidade: Joi.string().max(100),
    estado: Joi.string().length(2)
  })
});

const alterarStatus = celebrate({
  [Segments.BODY]: Joi.object().keys({
    status: Joi.string().required().valid('ATIVA', 'TESTE', 'INADIMPLENTE', 'SUSPENSA', 'CANCELADA'),
    motivo: Joi.string().when('status', {
      is: 'CANCELADA',
      then: Joi.string().required().min(10),
      otherwise: Joi.string().optional()
    })
  })
});

const registrarPagamento = celebrate({
  [Segments.BODY]: Joi.object().keys({
    mes: Joi.number().required().integer().min(1).max(12),
    ano: Joi.number().required().integer().min(2020).max(2030),
    valor: Joi.number().precision(2).positive(),
    formaPagamento: Joi.string().required().valid('BOLETO', 'CARTAO', 'PIX', 'TRANSFERENCIA')
  })
});

module.exports = {
  criarEmpresa,
  atualizarEmpresa,
  alterarStatus,
  registrarPagamento
};