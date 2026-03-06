// C:\Projetos\ponto-certo-backend\src\models\Empresa.js
const { DataTypes } = require('sequelize');
const { cnpj } = require('cpf-cnpj-validator');

module.exports = (sequelize) => {
  const Empresa = sequelize.define('Empresa', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    razaoSocial: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [3, 200]
      }
    },
    nomeFantasia: {
      type: DataTypes.STRING(200)
    },
    cnpj: {
      type: DataTypes.STRING(14),
      unique: true,
      allowNull: false,
      validate: {
        isCnpjValid(value) {
          if (!cnpj.isValid(value)) {
            throw new Error('CNPJ inválido');
          }
        }
      }
    },
    inscricaoEstadual: DataTypes.STRING(20),
    inscricaoMunicipal: DataTypes.STRING(20),
    
    // Contato
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    telefone: DataTypes.STRING(20),
    celular: DataTypes.STRING(20),
    site: DataTypes.STRING(100),
    
    // Endereço
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
      defaultValue: 5,
      validate: {
        min: 1,
        max: 31
      }
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
      defaultValue: () => new Date(+new Date() + 7*24*60*60*1000) // 7 dias
    },
    dataCancelamento: DataTypes.DATE,
    motivoCancelamento: DataTypes.TEXT,
    
    // Personalização (White Label)
    logo: DataTypes.STRING,
    icone: DataTypes.STRING,
    corPrimaria: {
      type: DataTypes.STRING(7),
      defaultValue: '#4361ee'
    },
    corSecundaria: {
      type: DataTypes.STRING(7),
      defaultValue: '#3f37c9'
    },
    corFundo: {
      type: DataTypes.STRING(7),
      defaultValue: '#f8f9fa'
    },
    dominioPersonalizado: DataTypes.STRING,
    
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    hooks: {
      beforeCreate: async (empresa) => {
        // Gerar slug do domínio
        if (empresa.nomeFantasia) {
          empresa.dominioPersonalizado = empresa.nomeFantasia
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-');
        }
      }
    }
  });

  // Métodos de instância
  Empresa.prototype.estaAtiva = function() {
    return this.status === 'ATIVA' || this.status === 'TESTE';
  };

  Empresa.prototype.podeAdicionarFuncionario = function(totalAtual) {
    return totalAtual < this.limiteFuncionarios;
  };

  Empresa.prototype.verificarTeste = function() {
    if (this.status === 'TESTE') {
      const hoje = new Date();
      if (hoje > this.dataExpiracaoTeste) {
        this.status = 'INADIMPLENTE';
        return false;
      }
      return true;
    }
    return true;
  };

  Empresa.prototype.getTema = function() {
    return {
      corPrimaria: this.corPrimaria,
      corSecundaria: this.corSecundaria,
      corFundo: this.corFundo,
      logo: this.logo,
      icone: this.icone
    };
  };

  return Empresa;
};