// C:\Projetos\ponto-certo-backend\src\models\index.js
const { Sequelize } = require('sequelize');
const config = require('../config/database')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config);

// Importar modelos
const Empresa = require('./Empresa')(sequelize);
const Usuario = require('./Usuario')(sequelize);
const Funcionario = require('./Funcionario')(sequelize);
const RegistroPonto = require('./RegistroPonto')(sequelize);
const Pagamento = require('./Pagamento')(sequelize);
const Ferias = require('./Ferias')(sequelize);
const Falta = require('./Falta')(sequelize);

// ========== RELACIONAMENTOS ==========

// Empresa -> Usuários
Empresa.hasMany(Usuario, { foreignKey: 'empresaId' });
Usuario.belongsTo(Empresa, { foreignKey: 'empresaId' });

// Empresa -> Funcionários
Empresa.hasMany(Funcionario, { foreignKey: 'empresaId' });
Funcionario.belongsTo(Empresa, { foreignKey: 'empresaId' });

// Empresa -> Registros de Ponto
Empresa.hasMany(RegistroPonto, { foreignKey: 'empresaId' });
RegistroPonto.belongsTo(Empresa, { foreignKey: 'empresaId' });

// Empresa -> Pagamentos
Empresa.hasMany(Pagamento, { foreignKey: 'empresaId' });
Pagamento.belongsTo(Empresa, { foreignKey: 'empresaId' });

// Funcionário -> Usuário
Funcionario.hasOne(Usuario, { foreignKey: 'funcionarioId' });
Usuario.belongsTo(Funcionario, { foreignKey: 'funcionarioId' });

// Funcionário -> Registros de Ponto
Funcionario.hasMany(RegistroPonto, { foreignKey: 'funcionarioId' });
RegistroPonto.belongsTo(Funcionario, { foreignKey: 'funcionarioId' });

// Funcionário -> Férias
Funcionario.hasMany(Ferias, { foreignKey: 'funcionarioId' });
Ferias.belongsTo(Funcionario, { foreignKey: 'funcionarioId' });

// Funcionário -> Faltas
Funcionario.hasMany(Falta, { foreignKey: 'funcionarioId' });
Falta.belongsTo(Funcionario, { foreignKey: 'funcionarioId' });

module.exports = {
  sequelize,
  Empresa,
  Usuario,
  Funcionario,
  RegistroPonto,
  Pagamento,
  Ferias,
  Falta
};