// C:\Projetos\ponto-certo-backend\src\utils\validadores.js
const { cpf, cnpj } = require('cpf-cnpj-validator');

class Validadores {
  // Validar CPF
  validarCPF(numero) {
    return cpf.isValid(numero);
  }

  // Validar CNPJ
  validarCNPJ(numero) {
    return cnpj.isValid(numero);
  }

  // Validar email
  validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Validar telefone
  validarTelefone(telefone) {
    const regex = /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/;
    return regex.test(telefone);
  }

  // Validar CEP
  validarCEP(cep) {
    const regex = /^[0-9]{5}-?[0-9]{3}$/;
    return regex.test(cep);
  }

  // Validar data
  validarData(data) {
    const date = new Date(data);
    return date instanceof Date && !isNaN(date);
  }

  // Validar hora (HH:MM)
  validarHora(hora) {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(hora);
  }

  // Validar PIN (6 dígitos)
  validarPin(pin) {
    const regex = /^[0-9]{6}$/;
    return regex.test(pin);
  }

  // Validar se é maior de idade
  isMaiorIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      return idade - 1 >= 18;
    }

    return idade >= 18;
  }
}

module.exports = new Validadores();