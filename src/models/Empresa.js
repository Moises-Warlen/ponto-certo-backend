// src/models/Empresa.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Empresa = sequelize.define('Empresa', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    razaoSocial: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    nomeFantasia: {
      type: DataTypes.STRING(200)
    },
    cnpj: {
      type: DataTypes.STRING(14),
      unique: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    telefone: DataTypes.STRING(20),
    celular: DataTypes.STRING(20),
    cep: DataTypes.STRING(8),
    endereco: DataTypes.STRING(200),
    numero: DataTypes.STRING(10),
    complemento: DataTypes.STRING(100),
    bairro: DataTypes.STRING(100),
    cidade: DataTypes.STRING(100),
    estado: DataTypes.STRING(2),
    
    // Plano
    plano: {
      type: DataTypes.ENUM('BASICO', 'PROFISSIONAL', 'ENTERPRISE'),
      defaultValue: 'BASICO'
    },
    limiteFuncionarios: {
      type: DataTypes.INTEGER,
      defaultValue: 10
    },
    valorMensal: {
      type: DataTypes.DECIMAL(10,2),
      defaultValue: 97.00
    },
    diaVencimento: {
      type: DataTypes.INTEGER,
      defaultValue: 5
    },
    
    // Status
    status: {
      type: DataTypes.ENUM('ATIVA', 'TESTE', 'INADIMPLENTE', 'SUSPENSA', 'CANCELADA'),
      defaultValue: 'TESTE'
    },
    dataCadastro: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    dataExpiracaoTeste: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(+new Date() + 7*24*60*60*1000)
    },
    
    // Personalização
    logo: DataTypes.STRING,
    corPrimaria: {
      type: DataTypes.STRING(7),
      defaultValue: '#4361ee'
    },
    corSecundaria: {
      type: DataTypes.STRING(7),
      defaultValue: '#3f37c9'
    },
    dominioPersonalizado: DataTypes.STRING,
    
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  });

  return Empresa;
};