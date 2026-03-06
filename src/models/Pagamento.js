// C:\Projetos\ponto-certo-backend\src\models\Pagamento.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Pagamento = sequelize.define('Pagamento', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    empresaId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    mes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12
      }
    },
    ano: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    valor: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    dataVencimento: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    dataPagamento: DataTypes.DATEONLY,
    formaPagamento: {
      type: DataTypes.ENUM('BOLETO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'TRANSFERENCIA', 'DINHEIRO'),
      defaultValue: 'BOLETO'
    },
    status: {
      type: DataTypes.ENUM('PAGO', 'PENDENTE', 'ATRASADO', 'CANCELADO', 'PROCESSANDO'),
      defaultValue: 'PENDENTE'
    },
    
    // Dados do pagamento
    transacaoId: DataTypes.STRING(100),
    codigoBarras: DataTypes.STRING(100),
    linhaDigitavel: DataTypes.STRING(100),
    pixCopiaECola: DataTypes.TEXT,
    qrCode: DataTypes.TEXT,
    
    // Comprovante
    comprovante: DataTypes.STRING,
    
    // Observações
    observacoes: DataTypes.TEXT,
    
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  });

  // Métodos de instância
  Pagamento.prototype.estaAtrasado = function() {
    if (this.status === 'PAGO') return false;
    const hoje = new Date();
    const vencimento = new Date(this.dataVencimento);
    return hoje > vencimento;
  };

  Pagamento.prototype.diasAtraso = function() {
    if (!this.estaAtrasado()) return 0;
    const hoje = new Date();
    const vencimento = new Date(this.dataVencimento);
    const diff = hoje - vencimento;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return Pagamento;
};