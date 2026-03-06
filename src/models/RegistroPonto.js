// C:\Projetos\ponto-certo-backend\src\models\RegistroPonto.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RegistroPonto = sequelize.define('RegistroPonto', {
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
    tipo: {
      type: DataTypes.ENUM('ENTRADA', 'SAIDA', 'INTERVALO', 'RETORNO', 'EXTRA'),
      allowNull: false
    },
    dataHora: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    
    // Geolocalização
    latitude: DataTypes.DECIMAL(10, 8),
    longitude: DataTypes.DECIMAL(11, 8),
    precisao: DataTypes.FLOAT,
    endereco: DataTypes.STRING(200),
    
    // Biometria
    foto: DataTypes.STRING,
    pontuacaoFacial: DataTypes.FLOAT,
    livenessScore: DataTypes.FLOAT,
    metodo: {
      type: DataTypes.ENUM('WEB', 'MOBILE', 'BIOMETRIA', 'FACIAL', 'MANUAL', 'QRCODE'),
      defaultValue: 'WEB'
    },
    
    // Validação
    valido: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    justificativa: DataTypes.TEXT,
    observacao: DataTypes.TEXT,
    
    // Dispositivo
    ip: DataTypes.STRING(45),
    dispositivo: DataTypes.STRING(200),
    userAgent: DataTypes.TEXT,
    
    // Metadados
    metadata: DataTypes.JSONB,
    
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  });

  // Métodos de instância
  
  RegistroPonto.prototype.getHorarioFormatado = function() {
    return this.dataHora.toLocaleTimeString('pt-BR');
  };

  RegistroPonto.prototype.getDataFormatada = function() {
    return this.dataHora.toLocaleDateString('pt-BR');
  };

  return RegistroPonto;
};