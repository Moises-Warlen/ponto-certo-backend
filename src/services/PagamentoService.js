// C:\Projetos\ponto-certo-backend\src\services\PagamentoService.js
const QRCode = require('qrcode');
const { format } = require('date-fns');

class PagamentoService {
  // Gerar boleto (simulado)
  async gerarBoleto(pagamento, empresa) {
    // Em produção, integrar com gateway de pagamento
    const nossoNumero = `${pagamento.ano}${pagamento.mes.toString().padStart(2, '0')}${empresa.id.slice(0, 8)}`;
    
    const linhaDigitavel = this.gerarLinhaDigitavel({
      banco: '001',
      moeda: '9',
      valor: pagamento.valor,
      vencimento: pagamento.dataVencimento,
      nossoNumero
    });

    const codigoBarras = this.gerarCodigoBarras(linhaDigitavel);

    return {
      linhaDigitavel,
      codigoBarras,
      url: `https://boleto.ponto-certo.com/${nossoNumero}`,
      nossoNumero
    };
  }

  // Gerar PIX (simulado)
  async gerarPix(pagamento, empresa) {
    // Em produção, integrar com gateway de pagamento
    const chavePix = `ponto-certo-${empresa.id}-${pagamento.ano}${pagamento.mes}`;
    
    const payload = {
      chave: chavePix,
      valor: pagamento.valor,
      beneficiario: empresa.nomeFantasia,
      cidade: empresa.cidade || 'Sao Paulo',
      identificador: `${pagamento.ano}${pagamento.mes.toString().padStart(2, '0')}`
    };

    const copiaECola = this.gerarCopiaEColaPix(payload);
    const qrCode = await QRCode.toDataURL(copiaECola);

    return {
      copiaECola,
      qrCode,
      chave: chavePix
    };
  }

  // Gerar linha digitável do boleto
  gerarLinhaDigitavel(dados) {
    const { banco, moeda, valor, vencimento, nossoNumero } = dados;
    
    const valorFormatado = (valor * 100).toString().padStart(10, '0');
    const fatorVencimento = this.calcularFatorVencimento(vencimento);
    
    // Formato: BBBM.CCCCD DDDPPPPPPPPP PPPPPPPPPP PPPPPPPPPP D
    const campo1 = banco + moeda + nossoNumero.slice(0, 5);
    const campo2 = nossoNumero.slice(5, 10) + valorFormatado.slice(0, 5);
    const campo3 = valorFormatado.slice(5, 10) + '000000';
    const campo4 = '0'; // Dígito verificador geral
    const campo5 = fatorVencimento + valorFormatado;

    return `${campo1} ${campo2} ${campo3} ${campo4} ${campo5}`;
  }

  // Gerar código de barras
  gerarCodigoBarras(linhaDigitavel) {
    return linhaDigitavel.replace(/\D/g, '');
  }

  // Calcular fator de vencimento (dias desde 07/10/1997)
  calcularFatorVencimento(data) {
    const base = new Date('1997-10-07');
    const diff = data - base;
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    return (1000 + dias).toString();
  }

  // Gerar copia e cola PIX
  gerarCopiaEColaPix(dados) {
    // Formato PIX BR Code
    const payload = [
      '000201', // Payload Format Indicator
      '26360014BR.GOV.BCB.PIX' + this.calcularTamanhoCampo(dados.chave) + dados.chave, // Merchant Account Information
      '52040000', // Merchant Category Code
      '5303986', // Transaction Currency (BRL)
      '5405' + dados.valor.toFixed(2).replace('.', '').padStart(5, '0'), // Transaction Amount
      '5802BR', // Country Code
      '5900' + this.calcularTamanhoCampo(dados.beneficiario) + dados.beneficiario, // Merchant Name
      '6000' + this.calcularTamanhoCampo(dados.cidade) + dados.cidade, // Merchant City
      '62070503***', // Additional Data Field
      '6304' // CRC
    ].join('');

    // Calcular CRC16
    const crc = this.calcularCRC16(payload + '6304');
    return payload + crc;
  }

  calcularTamanhoCampo(valor) {
    return valor.length.toString().padStart(2, '0');
  }

  calcularCRC16(payload) {
    // Implementação simplificada do CRC16
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc <<= 1;
        }
      }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  }
}

module.exports = new PagamentoService();