// src/models/Usuario.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    empresaId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Empresas',
        key: 'id'
      }
    },
    funcionarioId: {
      type: DataTypes.UUID,
      references: {
        model: 'Funcionarios',
        key: 'id'
      }
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    senha: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    telefone: DataTypes.STRING(20),
    foto: DataTypes.STRING,
    
    tipo: {
      type: DataTypes.ENUM('MASTER', 'ADMIN_EMPRESA', 'GESTOR', 'FUNCIONARIO'),
      defaultValue: 'FUNCIONARIO'
    },
    
    permissoes: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    
    doisFatoresAtivo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    segredo2FA: DataTypes.STRING,
    
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    ultimoAcesso: DataTypes.DATE,
    tentativasLogin: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    bloqueadoAte: DataTypes.DATE,
    
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.senha) {
          user.senha = await bcrypt.hash(user.senha, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('senha')) {
          user.senha = await bcrypt.hash(user.senha, 10);
        }
      }
    }
  });

  Usuario.prototype.verificarSenha = function(senha) {
    return bcrypt.compareSync(senha, this.senha);
  };

  return Usuario;
};