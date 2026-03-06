// src/config/database.js
require('dotenv').config();

module.exports = {
  development: {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  },
  production: {
    dialect: 'postgres',
    use_env_variable: 'DATABASE_URL',  // ✅ SÓ O NOME DA VARIÁVEL
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
};