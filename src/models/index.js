// src/models/index.js
const { Sequelize } = require('sequelize');
const config = require('../config/database')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config);

// Importar modelos
const Empresa = require('./Empresa')(sequelize);
const Usuario = require('./Usuario')(sequelize);

// Relacionamentos
Empresa.hasMany(Usuario, { foreignKey: 'empresaId' });
Usuario.belongsTo(Empresa, { foreignKey: 'empresaId' });

module.exports = {
  sequelize,
  Empresa,
  Usuario
};