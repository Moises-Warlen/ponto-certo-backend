// C:\Projetos\ponto-certo-backend\src\models\Funcionario.js
const { DataTypes } = require('sequelize');
const { cpf } = require('cpf-cnpj-validator');

module.exports = (sequelize) => {
  const Funcionario = sequelize.define('Funcionario', {
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
    
    // Dados Pessoais
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cpf: {
      type: DataTypes.STRING(11),
      allowNull: false,
      validate: {
        isCpfValid(value) {
          if (!cpf.isValid(value)) {
            throw new Error('CPF inválido');
          }
        }
      }
    },
    rg: DataTypes.STRING(20),
    dataNascimento: DataTypes.DATEONLY,
    sexo: DataTypes.ENUM('M', 'F', 'OUTRO'),
    estadoCivil: DataTypes.ENUM('SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO'),
    
    // Contato
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    emailCorporativo: DataTypes.STRING(100),
    telefone: DataTypes.STRING(20),
    celular: DataTypes.STRING(20),
    whatsapp: DataTypes.STRING(20),
    
    // Endereço
    cep: DataTypes.STRING(8),
    endereco: DataTypes.STRING(200),
    numero: DataTypes.STRING(10),
    complemento: DataTypes.STRING(100),
    bairro: DataTypes.STRING(100),
    cidade: DataTypes.STRING(100),
    estado: DataTypes.STRING(2),
    
    // Profissional
    matricula: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    departamento: DataTypes.STRING(50),
    cargo: DataTypes.STRING(50),
    dataAdmissao: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW
    },
    dataDemissao: DataTypes.DATEONLY,
    tipoContrato: {
      type: DataTypes.ENUM('CLT', 'PJ', 'ESTAGIO', 'TEMPORARIO', 'APRENDIZ'),
      defaultValue: 'CLT'
    },
    salario: DataTypes.DECIMAL(10,2),
    cargaHorariaSemanal: {
      type: DataTypes.INTEGER,
      defaultValue: 44
    },
    turno: {
      type: DataTypes.ENUM('MANHA', 'TARDE', 'NOITE', 'COMERCIAL', 'ESCALA'),
      defaultValue: 'COMERCIAL'
    },
    horarioEntrada: DataTypes.STRING(5), // 08:00
    horarioSaida: DataTypes.STRING(5),   // 18:00
    intervaloMinutos: {
      type: DataTypes.INTEGER,
      defaultValue: 60
    },
    
    // Banco
    banco: DataTypes.STRING(50),
    agencia: DataTypes.STRING(10),
    conta: DataTypes.STRING(20),
    tipoConta: DataTypes.ENUM('CORRENTE', 'POUPANCA'),
    pix: DataTypes.STRING(100),
    
    // Dependentes
    dependentes: DataTypes.JSONB,
    
    // Emergência
    contatoEmergenciaNome: DataTypes.STRING(100),
    contatoEmergenciaParentesco: DataTypes.STRING(50),
    contatoEmergenciaTelefone: DataTypes.STRING(20),
    
    // Biometria
    pinAcesso: {
      type: DataTypes.STRING(6),
      defaultValue: () => Math.floor(100000 + Math.random() * 900000).toString()
    },
    foto: DataTypes.STRING,
    fotosBiometria: DataTypes.JSONB,
    dadosBiometricos: DataTypes.JSONB,
    
    // Configurações
    usarBiometria: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    notificacoes: {
      type: DataTypes.JSONB,
      defaultValue: {
        email: true,
        whatsapp: false,
        push: false
      }
    },
    
    // Status
    status: {
      type: DataTypes.ENUM('ATIVO', 'INATIVO', 'FERIAS', 'LICENCA', 'AFASTADO', 'DEMITIDO'),
      defaultValue: 'ATIVO'
    },
    
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    hooks: {
      beforeCreate: async (func) => {
        // Gerar matrícula se não informada
        if (!func.matricula) {
          const ano = new Date().getFullYear();
          const random = Math.floor(1000 + Math.random() * 9000);
          func.matricula = `${ano}${random}`;
        }
      }
    }
  });

  // Métodos de instância
  Funcionario.prototype.validarPin = function(pin) {
    return this.pinAcesso === pin;
  };

  Funcionario.prototype.gerarNovoPin = function() {
    this.pinAcesso = Math.floor(100000 + Math.random() * 900000).toString();
    return this.pinAcesso;
  };

  Funcionario.prototype.estaAtivo = function() {
    return this.status === 'ATIVO';
  };

  Funcionario.prototype.registrarFerias = function(inicio, fim) {
    this.status = 'FERIAS';
    // Lógica para registrar férias
  };

  Funcionario.prototype.demitir = function(data, motivo) {
    this.status = 'DEMITIDO';
    this.dataDemissao = data || new Date();
    this.motivoDemissao = motivo;
  };

  return Funcionario;
};