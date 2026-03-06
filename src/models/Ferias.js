// C:\Projetos\ponto-certo-backend\src\models\Ferias.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ferias = sequelize.define('Ferias', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    empresaId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    funcionarioId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    
    // Período aquisitivo
    periodoAquisitivoInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    periodoAquisitivoFim: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    
    // Período de gozo
    dataInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    dataFim: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    diasSolicitados: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 30
      }
    },
    
    // Abono pecuniário (venda de férias)
    diasAbono: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        max: 10
      }
    },
    valorAbono: DataTypes.DECIMAL(10,2),
    
    // 1/3 constitucional
    valorTerco: DataTypes.DECIMAL(10,2),
    valorTotal: DataTypes.DECIMAL(10,2),
    
    // Status
    status: {
      type: DataTypes.ENUM('AGENDADO', 'APROVADO', 'CANCELADO', 'REALIZADO'),
      defaultValue: 'AGENDADO'
    },
    
    // Aprovação
    aprovadoPor: DataTypes.UUID,
    dataAprovacao: DataTypes.DATE,
    
    // Observações
    observacoes: DataTypes.TEXT,
    
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  });

  return Ferias;
};