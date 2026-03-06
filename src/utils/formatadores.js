// C:\Projetos\ponto-certo-backend\src\utils\formatadores.js
class Formatadores {
  // Formatar CPF
  formatarCPF(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  // Formatar CNPJ
  formatarCNPJ(cnpj) {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  // Formatar telefone
  formatarTelefone(telefone) {
    if (telefone.length === 10) {
      return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  // Formatar CEP
  formatarCEP(cep) {
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  // Formatar data
  formatarData(data, formato = 'dd/MM/yyyy') {
    const d = new Date(data);
    const dia = d.getDate().toString().padStart(2, '0');
    const mes = (d.getMonth() + 1).toString().padStart(2, '0');
    const ano = d.getFullYear();

    return formato
      .replace('dd', dia)
      .replace('MM', mes)
      .replace('yyyy', ano);
  }

  // Formatar hora
  formatarHora(data) {
    const d = new Date(data);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  // Formatar data e hora
  formatarDataHora(data) {
    return `${this.formatarData(data)} ${this.formatarHora(data)}`;
  }

  // Formatar valor monetário
  formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  // Formatar percentual
  formatarPercentual(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor / 100);
  }

  // Formatar minutos em horas
  formatarMinutosParaHoras(minutos) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}min`;
  }

  // Formatar nome próprio (primeira letra maiúscula)
  formatarNome(nome) {
    return nome.toLowerCase().replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
  }

  // Remover formatação
  limparFormatacao(valor) {
    return valor.replace(/[^\d]/g, '');
  }
}

module.exports = new Formatadores();