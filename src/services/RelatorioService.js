// C:\Projetos\ponto-certo-backend\src\services\RelatorioService.js
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { format, differenceInMinutes, parse } = require('date-fns');
const { ptBR } = require('date-fns/locale');

class RelatorioService {
  // Gerar relatório mensal
  async gerarRelatorioMensal(registros, funcionarioId, mes, ano) {
    // Agrupar registros por dia
    const dias = {};

    registros.forEach(reg => {
      const dia = format(reg.dataHora, 'yyyy-MM-dd');
      if (!dias[dia]) {
        dias[dia] = [];
      }
      dias[dia].push(reg);
    });

    // Calcular horas por dia
    const horasPorDia = [];
    let totalHoras = 0;
    let totalExtras = 0;
    let totalFaltas = 0;

    Object.keys(dias).sort().forEach(dia => {
      const registrosDia = dias[dia];
      let horasTrabalhadas = 0;
      let ultimaEntrada = null;

      registrosDia.forEach(reg => {
        if (reg.tipo === 'ENTRADA') {
          ultimaEntrada = reg.dataHora;
        } else if (reg.tipo === 'SAIDA' && ultimaEntrada) {
          const minutos = differenceInMinutes(reg.dataHora, ultimaEntrada);
          horasTrabalhadas += minutos / 60;
          ultimaEntrada = null;
        }
      });

      if (horasTrabalhadas > 0) {
        totalHoras += horasTrabalhadas;
        horasPorDia.push({
          dia,
          horas: horasTrabalhadas,
          registros: registrosDia
        });
      } else {
        totalFaltas++;
      }
    });

    return {
      funcionarioId,
      mes,
      ano,
      totalDias: Object.keys(dias).length,
      totalFaltas,
      totalHoras: this.formatarHoras(totalHoras),
      totalHorasDecimal: totalHoras,
      totalExtras: this.formatarHoras(totalExtras),
      dias: horasPorDia
    };
  }

  // Gerar comprovante em PDF
  async gerarComprovante(registro) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Cabeçalho
        doc.fontSize(20).text('Ponto-Certo', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text('Comprovante de Ponto', { align: 'center' });
        doc.moveDown(2);

        // Linha divisória
        doc.strokeColor('#4361ee').lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Informações
        doc.fontSize(12);
        doc.text(`Funcionário: ${registro.Funcionario?.nome || 'N/A'}`);
        doc.text(`Data: ${format(registro.dataHora, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`);
        doc.text(`Horário: ${format(registro.dataHora, 'HH:mm:ss')}`);
        doc.text(`Tipo: ${this.getTipoPonto(registro.tipo)}`);
        doc.text(`Método: ${this.getMetodo(registro.metodo)}`);

        if (registro.latitude && registro.longitude) {
          doc.text(`Localização: ${registro.latitude}, ${registro.longitude}`);
        }

        if (registro.observacao) {
          doc.text(`Observação: ${registro.observacao}`);
        }

        doc.moveDown(2);

        // Código de autenticação
        doc.fontSize(10).text(`Código de autenticação: ${registro.id}`, { align: 'center' });

        // Rodapé
        doc.moveDown(4);
        doc.fontSize(8).text('Documento gerado eletronicamente pelo Sistema Ponto-Certo', { align: 'center' });
        doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`, { align: 'center' });

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  // Gerar relatório em PDF
  async gerarPDF(registros) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Cabeçalho
        doc.fontSize(20).text('Ponto-Certo', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text('Relatório de Pontos', { align: 'center' });
        doc.moveDown(2);

        // Período
        if (registros.length > 0) {
          const primeiro = registros[0];
          const ultimo = registros[registros.length - 1];
          doc.fontSize(12).text(
            `Período: ${format(primeiro.dataHora, 'dd/MM/yyyy')} à ${format(ultimo.dataHora, 'dd/MM/yyyy')}`,
            { align: 'center' }
          );
          doc.moveDown();
        }

        // Tabela
        const tableTop = doc.y;
        const tableLeft = 50;

        // Cabeçalho da tabela
        doc.font('Helvetica-Bold');
        doc.text('Data', tableLeft, tableTop);
        doc.text('Horário', tableLeft + 100, tableTop);
        doc.text('Tipo', tableLeft + 200, tableTop);
        doc.text('Funcionário', tableLeft + 300, tableTop);

        doc.font('Helvetica');
        let y = tableTop + 20;

        // Dados
        registros.forEach(reg => {
          if (y > 700) { // Nova página
            doc.addPage();
            y = 50;

            doc.font('Helvetica-Bold');
            doc.text('Data', tableLeft, y);
            doc.text('Horário', tableLeft + 100, y);
            doc.text('Tipo', tableLeft + 200, y);
            doc.text('Funcionário', tableLeft + 300, y);
            doc.font('Helvetica');
            y += 20;
          }

          doc.text(format(reg.dataHora, 'dd/MM/yyyy'), tableLeft, y);
          doc.text(format(reg.dataHora, 'HH:mm'), tableLeft + 100, y);
          doc.text(this.getTipoPonto(reg.tipo), tableLeft + 200, y);
          doc.text(reg.Funcionario?.nome || '-', tableLeft + 300, y, { width: 200 });

          y += 20;
        });

        // Resumo
        doc.moveDown(2);
        doc.font('Helvetica-Bold');
        doc.text('Resumo:');
        doc.font('Helvetica');
        doc.text(`Total de registros: ${registros.length}`);

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  // Gerar relatório em Excel
  async gerarExcel(registros) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Registros de Ponto');

    // Configurar colunas
    worksheet.columns = [
      { header: 'Data', key: 'data', width: 15 },
      { header: 'Horário', key: 'horario', width: 10 },
      { header: 'Tipo', key: 'tipo', width: 15 },
      { header: 'Funcionário', key: 'funcionario', width: 30 },
      { header: 'Departamento', key: 'departamento', width: 20 },
      { header: 'Método', key: 'metodo', width: 15 },
      { header: 'Localização', key: 'localizacao', width: 25 },
      { header: 'Observação', key: 'observacao', width: 30 }
    ];

    // Estilizar cabeçalho
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4361EE' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' } };

    // Adicionar dados
    registros.forEach(reg => {
      worksheet.addRow({
        data: format(reg.dataHora, 'dd/MM/yyyy'),
        horario: format(reg.dataHora, 'HH:mm:ss'),
        tipo: this.getTipoPonto(reg.tipo),
        funcionario: reg.Funcionario?.nome || '-',
        departamento: reg.Funcionario?.departamento || '-',
        metodo: this.getMetodo(reg.metodo),
        localizacao: reg.latitude && reg.longitude ? `${reg.latitude}, ${reg.longitude}` : '-',
        observacao: reg.observacao || '-'
      });
    });

    // Adicionar total
    const totalRow = worksheet.addRow({
      data: 'TOTAL',
      funcionario: `${registros.length} registros`
    });
    totalRow.font = { bold: true };

    // Converter para buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  // Formatar horas
  formatarHoras(horasDecimal) {
    const horas = Math.floor(horasDecimal);
    const minutos = Math.round((horasDecimal - horas) * 60);
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  }

  // Traduzir tipo de ponto
  getTipoPonto(tipo) {
    const tipos = {
      'ENTRADA': 'Entrada',
      'SAIDA': 'Saída',
      'INTERVALO': 'Início Intervalo',
      'RETORNO': 'Fim Intervalo',
      'EXTRA': 'Hora Extra'
    };
    return tipos[tipo] || tipo;
  }

  // Traduzir método
  getMetodo(metodo) {
    const metodos = {
      'WEB': 'Web',
      'MOBILE': 'Mobile',
      'BIOMETRIA': 'Biometria',
      'FACIAL': 'Reconhecimento Facial',
      'MANUAL': 'Manual'
    };
    return metodos[metodo] || metodo;
  }
}

module.exports = new RelatorioService();