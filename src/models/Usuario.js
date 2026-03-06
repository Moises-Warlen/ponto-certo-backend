// C:\Projetos\ponto-certo-backend\src\models\Usuario.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { permissoesPadrao } = require('../config/auth');

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
      allowNull: false,
      validate: {
        len: [3, 100]
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
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
    
    // Permissões (JSON)
    permissoes: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    
    // 2FA
    doisFatoresAtivo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    segredo2FA: DataTypes.STRING,
    codigosRecuperacao2FA: DataTypes.JSONB,
    
    // Controle de acesso
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    ultimoAcesso: DataTypes.DATE,
    ultimoIP: DataTypes.STRING(45),
    tentativasLogin: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    bloqueadoAte: DataTypes.DATE,
    
    // Notificações
    notificacoes: {
      type: DataTypes.JSONB,
      defaultValue: {
        email: true,
        push: true,
        whatsapp: false
      }
    },
    
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.senha) {
          user.senha = await bcrypt.hash(user.senha, 10);
        }
        // Atribuir permissões padrão baseado no tipo
        user.permissoes = permissoesPadrao[user.tipo] || {};
      },
      beforeUpdate: async (user) => {
        if (user.changed('senha')) {
          user.senha = await bcrypt.hash(user.senha, 10);
        }
        if (user.changed('tipo')) {
          user.permissoes = permissoesPadrao[user.tipo] || {};
        }
      }
    }
  });

  // Métodos de instância
  Usuario.prototype.verificarSenha = function(senha) {
    return bcrypt.compareSync(senha, this.senha);
  };

  Usuario.prototype.temPermissao = function(permissao) {
    if (this.tipo === 'MASTER') return true;
    return this.permissoes[permissao] || false;
  };

  Usuario.prototype.registrarTentativa = function(sucesso) {
    if (sucesso) {
      this.tentativasLogin = 0;
      this.bloqueadoAte = null;
    } else {
      this.tentativasLogin += 1;
      if (this.tentativasLogin >= 5) {
        this.bloqueadoAte = new Date(Date.now() + 30 * 60 * 1000);
      }
    }
  };

  Usuario.prototype.estaBloqueado = function() {
    return this.bloqueadoAte && this.bloqueadoAte > new Date();
  };

  Usuario.prototype.ativar2FA = function(segredo) {
    this.doisFatoresAtivo = true;
    this.segredo2FA = segredo;
  };

  Usuario.prototype.desativar2FA = function() {
    this.doisFatoresAtivo = false;
    this.segredo2FA = null;
  };

  return Usuario;
};