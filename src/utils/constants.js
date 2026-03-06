// C:\Projetos\ponto-certo-backend\src\utils\constants.js
module.exports = {
  // Tipos de plano
  PLANOS: {
    BASICO: {
      nome: 'Básico',
      valor: 97,
      limiteFuncionarios: 10,
      features: [
        'Registro de ponto',
        'Relatórios básicos',
        'App mobile'
      ]
    },
    PROFISSIONAL: {
      nome: 'Profissional',
      valor: 197,
      limiteFuncionarios: 50,
      features: [
        'Tudo do Básico',
        'Biometria facial',
        'Relatórios avançados',
        'API de integração'
      ]
    },
    ENTERPRISE: {
      nome: 'Enterprise',
      valor: 497,
      limiteFuncionarios: 999999,
      features: [
        'Tudo do Profissional',
        'Funcionários ilimitados',
        'White label',
        'Suporte prioritário',
        'Treinamento incluso'
      ]
    }
  },

  // Status da empresa
  STATUS_EMPRESA: {
    ATIVA: 'ATIVA',
    TESTE: 'TESTE',
    INADIMPLENTE: 'INADIMPLENTE',
    SUSPENSA: 'SUSPENSA',
    CANCELADA: 'CANCELADA'
  },

  // Status do funcionário
  STATUS_FUNCIONARIO: {
    ATIVO: 'ATIVO',
    INATIVO: 'INATIVO',
    FERIAS: 'FERIAS',
    LICENCA: 'LICENCA',
    AFASTADO: 'AFASTADO',
    DEMITIDO: 'DEMITIDO'
  },

  // Tipos de registro de ponto
  TIPOS_PONTO: {
    ENTRADA: 'ENTRADA',
    SAIDA: 'SAIDA',
    INTERVALO: 'INTERVALO',
    RETORNO: 'RETORNO',
    EXTRA: 'EXTRA'
  },

  // Métodos de registro
  METODOS_REGISTRO: {
    WEB: 'WEB',
    MOBILE: 'MOBILE',
    BIOMETRIA: 'BIOMETRIA',
    FACIAL: 'FACIAL',
    MANUAL: 'MANUAL'
  },

  // Tipos de usuário
  TIPOS_USUARIO: {
    MASTER: 'MASTER',
    ADMIN_EMPRESA: 'ADMIN_EMPRESA',
    GESTOR: 'GESTOR',
    FUNCIONARIO: 'FUNCIONARIO'
  },

  // Dias da semana
  DIAS_SEMANA: {
    0: 'Domingo',
    1: 'Segunda',
    2: 'Terça',
    3: 'Quarta',
    4: 'Quinta',
    5: 'Sexta',
    6: 'Sábado'
  },

  // Meses
  MESES: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],

  // Estados brasileiros
  ESTADOS: {
    AC: 'Acre',
    AL: 'Alagoas',
    AP: 'Amapá',
    AM: 'Amazonas',
    BA: 'Bahia',
    CE: 'Ceará',
    DF: 'Distrito Federal',
    ES: 'Espírito Santo',
    GO: 'Goiás',
    MA: 'Maranhão',
    MT: 'Mato Grosso',
    MS: 'Mato Grosso do Sul',
    MG: 'Minas Gerais',
    PA: 'Pará',
    PB: 'Paraíba',
    PR: 'Paraná',
    PE: 'Pernambuco',
    PI: 'Piauí',
    RJ: 'Rio de Janeiro',
    RN: 'Rio Grande do Norte',
    RS: 'Rio Grande do Sul',
    RO: 'Rondônia',
    RR: 'Roraima',
    SC: 'Santa Catarina',
    SP: 'São Paulo',
    SE: 'Sergipe',
    TO: 'Tocantins'
  },

  // Limites
  LIMITES: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_FOTOS_BIOMETRIA: 5,
    TENTATIVAS_LOGIN: 5,
    BLOQUEIO_MINUTOS: 30,
    DIAS_TESTE: 7,
    TOLERANCIA_ATRASO: 10 // minutos
  },

  // Cores padrão
  CORES_PADRAO: {
    primaria: '#4361ee',
    secundaria: '#3f37c9',
    fundo: '#f8f9fa',
    texto: '#212529',
    sucesso: '#4caf50',
    erro: '#f44336',
    aviso: '#ff9800'
  }
};