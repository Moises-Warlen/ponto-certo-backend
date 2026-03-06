// C:\Projetos\ponto-certo-backend\src\config\auth.js
module.exports = {
  // Permissões por tipo de usuário
  permissoesPadrao: {
    MASTER: {
      // Ponto
      registrarProprioPonto: true,
      registrarPontoOutros: true,
      visualizarPropriosRegistros: true,
      visualizarRegistrosDepartamento: true,
      visualizarRegistrosGeral: true,
      editarRegistros: true,
      excluirRegistros: true,
      
      // Funcionários
      visualizarFuncionarios: true,
      cadastrarFuncionario: true,
      editarFuncionario: true,
      excluirFuncionario: true,
      ativarDesativarFuncionario: true,
      
      // Relatórios
      gerarRelatoriosProprios: true,
      gerarRelatoriosDepartamento: true,
      gerarRelatoriosGerais: true,
      exportarRelatorios: true,
      imprimirRelatorios: true,
      
      // Férias
      solicitarFerias: true,
      aprovarFerias: true,
      visualizarFerias: true,
      
      // Faltas
      justificarFaltasProprias: true,
      justificarFaltasOutros: true,
      
      // Admin
      gerenciarUsuarios: true,
      gerenciarPermissoes: true,
      visualizarFinanceiro: true,
      gerenciarAssinatura: true
    },
    
    ADMIN_EMPRESA: {
      registrarProprioPonto: true,
      registrarPontoOutros: true,
      visualizarPropriosRegistros: true,
      visualizarRegistrosDepartamento: true,
      visualizarRegistrosGeral: true,
      editarRegistros: false,
      excluirRegistros: false,
      visualizarFuncionarios: true,
      cadastrarFuncionario: true,
      editarFuncionario: true,
      excluirFuncionario: false,
      ativarDesativarFuncionario: true,
      gerarRelatoriosProprios: true,
      gerarRelatoriosDepartamento: true,
      gerarRelatoriosGerais: true,
      exportarRelatorios: true,
      imprimirRelatorios: true,
      solicitarFerias: true,
      aprovarFerias: true,
      visualizarFerias: true,
      justificarFaltasProprias: true,
      justificarFaltasOutros: true,
      gerenciarUsuarios: true,
      gerenciarPermissoes: false,
      visualizarFinanceiro: false,
      gerenciarAssinatura: false
    },
    
    GESTOR: {
      registrarProprioPonto: true,
      registrarPontoOutros: false,
      visualizarPropriosRegistros: true,
      visualizarRegistrosDepartamento: true,
      visualizarRegistrosGeral: false,
      editarRegistros: false,
      excluirRegistros: false,
      visualizarFuncionarios: true,
      cadastrarFuncionario: false,
      editarFuncionario: true,
      excluirFuncionario: false,
      ativarDesativarFuncionario: false,
      gerarRelatoriosProprios: true,
      gerarRelatoriosDepartamento: true,
      gerarRelatoriosGerais: false,
      exportarRelatorios: true,
      imprimirRelatorios: true,
      solicitarFerias: true,
      aprovarFerias: false,
      visualizarFerias: true,
      justificarFaltasProprias: true,
      justificarFaltasOutros: true,
      gerenciarUsuarios: false,
      gerenciarPermissoes: false,
      visualizarFinanceiro: false,
      gerenciarAssinatura: false
    },
    
    FUNCIONARIO: {
      registrarProprioPonto: true,
      registrarPontoOutros: false,
      visualizarPropriosRegistros: true,
      visualizarRegistrosDepartamento: false,
      visualizarRegistrosGeral: false,
      editarRegistros: false,
      excluirRegistros: false,
      visualizarFuncionarios: false,
      cadastrarFuncionario: false,
      editarFuncionario: false,
      excluirFuncionario: false,
      ativarDesativarFuncionario: false,
      gerarRelatoriosProprios: true,
      gerarRelatoriosDepartamento: false,
      gerarRelatoriosGerais: false,
      exportarRelatorios: true,
      imprimirRelatorios: true,
      solicitarFerias: true,
      aprovarFerias: false,
      visualizarFerias: true,
      justificarFaltasProprias: true,
      justificarFaltasOutros: false,
      gerenciarUsuarios: false,
      gerenciarPermissoes: false,
      visualizarFinanceiro: false,
      gerenciarAssinatura: false
    }
  }
};