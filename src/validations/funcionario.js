// C:\Projetos\ponto-certo-backend\src\validations\funcionario.js
const { celebrate, Segments, Joi } = require('celebrate');

const criarFuncionario = celebrate({
  [Segments.BODY]: Joi.object().keys({
    nome: Joi.string().required().min(3).max(100),
    cpf: Joi.string().required().length(11).pattern(/^\d+$/),
    rg: Joi.string().max(20),
    dataNascimento: Joi.date().required().max('now'),
    sexo: Joi.string().valid('M', 'F', 'OUTRO'),
    estadoCivil: Joi.string().valid('SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO'),
    email: Joi.string().required().email(),
    emailCorporativo: Joi.string().email(),
    telefone: Joi.string().max(20),
    celular: Joi.string().max(20),
    whatsapp: Joi.string().max(20),
    cep: Joi.string().length(8).pattern(/^\d+$/),
    endereco: Joi.string().max(200),
    numero: Joi.string().max(10),
    complemento: Joi.string().max(100),
    bairro: Joi.string().max(100),
    cidade: Joi.string().max(100),
    estado: Joi.string().length(2),
    departamento: Joi.string().max(50),
    cargo: Joi.string().max(50),
    dataAdmissao: Joi.date().required(),
    tipoContrato: Joi.string().valid('CLT', 'PJ', 'ESTAGIO', 'TEMPORARIO', 'APRENDIZ'),
    salario: Joi.number().precision(2).positive(),
    cargaHorariaSemanal: Joi.number().integer().min(1).max(44),
    turno: Joi.string().valid('MANHA', 'TARDE', 'NOITE', 'COMERCIAL', 'ESCALA'),
    horarioEntrada: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    horarioSaida: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    intervaloMinutos: Joi.number().integer().min(0).max(120),
    banco: Joi.string().max(50),
    agencia: Joi.string().max(10),
    conta: Joi.string().max(20),
    tipoConta: Joi.string().valid('CORRENTE', 'POUPANCA'),
    pix: Joi.string().max(100),
    contatoEmergenciaNome: Joi.string().max(100),
    contatoEmergenciaParentesco: Joi.string().max(50),
    contatoEmergenciaTelefone: Joi.string().max(20),
    usarBiometria: Joi.boolean()
  })
});

const atualizarFuncionario = celebrate({
  [Segments.BODY]: Joi.object().keys({
    nome: Joi.string().min(3).max(100),
    rg: Joi.string().max(20),
    sexo: Joi.string().valid('M', 'F', 'OUTRO'),
    estadoCivil: Joi.string().valid('SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO'),
    email: Joi.string().email(),
    emailCorporativo: Joi.string().email(),
    telefone: Joi.string().max(20),
    celular: Joi.string().max(20),
    whatsapp: Joi.string().max(20),
    cep: Joi.string().length(8).pattern(/^\d+$/),
    endereco: Joi.string().max(200),
    numero: Joi.string().max(10),
    complemento: Joi.string().max(100),
    bairro: Joi.string().max(100),
    cidade: Joi.string().max(100),
    estado: Joi.string().length(2),
    departamento: Joi.string().max(50),
    cargo: Joi.string().max(50),
    salario: Joi.number().precision(2).positive(),
    cargaHorariaSemanal: Joi.number().integer().min(1).max(44),
    turno: Joi.string().valid('MANHA', 'TARDE', 'NOITE', 'COMERCIAL', 'ESCALA'),
    horarioEntrada: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    horarioSaida: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    intervaloMinutos: Joi.number().integer().min(0).max(120),
    banco: Joi.string().max(50),
    agencia: Joi.string().max(10),
    conta: Joi.string().max(20),
    tipoConta: Joi.string().valid('CORRENTE', 'POUPANCA'),
    pix: Joi.string().max(100),
    contatoEmergenciaNome: Joi.string().max(100),
    contatoEmergenciaParentesco: Joi.string().max(50),
    contatoEmergenciaTelefone: Joi.string().max(20),
    usarBiometria: Joi.boolean()
  })
});

const alterarStatusFuncionario = celebrate({
  [Segments.BODY]: Joi.object().keys({
    status: Joi.string().required().valid('ATIVO', 'INATIVO', 'FERIAS', 'LICENCA', 'AFASTADO', 'DEMITIDO'),
    motivo: Joi.string().when('status', {
      is: 'DEMITIDO',
      then: Joi.string().required().min(10),
      otherwise: Joi.string().optional()
    })
  })
});

module.exports = {
  criarFuncionario,
  atualizarFuncionario,
  alterarStatusFuncionario
};