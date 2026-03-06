// C:\Projetos\ponto-certo-backend\src\utils\geradores.js
const crypto = require('crypto');

class Geradores {
  // Gerar matrícula única
  gerarMatricula(prefixo = '') {
    const ano = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefixo}${ano}${random}`;
  }

  // Gerar PIN de acesso
  gerarPin() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Gerar senha aleatória
  gerarSenha(tamanho = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let senha = '';
    for (let i = 0; i < tamanho; i++) {
      senha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return senha;
  }

  // Gerar token único
  gerarToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Gerar código de barras (simulado)
  gerarCodigoBarras() {
    const prefixo = '123';
    const timestamp = Date.now().toString().slice(-10);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const digito = this.calcularDigitoVerificador(prefixo + timestamp + random);
    return prefixo + timestamp + random + digito;
  }

  // Calcular dígito verificador (módulo 11)
  calcularDigitoVerificador(numero) {
    let soma = 0;
    let multiplicador = 2;

    for (let i = numero.length - 1; i >= 0; i--) {
      soma += parseInt(numero.charAt(i)) * multiplicador;
      multiplicador = multiplicador === 9 ? 2 : multiplicador + 1;
    }

    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  }

  // Gerar código PIX (simulado)
  gerarCodigoPix() {
    return crypto.randomBytes(20).toString('hex').toUpperCase();
  }

  // Gerar hash de arquivo
  gerarHashArquivo(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
}

module.exports = new Geradores();