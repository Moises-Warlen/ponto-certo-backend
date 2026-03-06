// C:\Projetos\ponto-certo-backend\src\jobs\enviarRelatorios.js
const { Funcionario, RegistroPonto } = require('../models');
const { Op } = require('sequelize');
const { startOfMonth, endOfMonth, subMonths } = require('date-fns');
const RelatorioService = require('../services/RelatorioService');
const EmailService = require('../services/EmailService');
const logger = require('../utils/logger');

async function enviarRelatoriosMensais() {
  try {
    logger.info('📊 Iniciando envio de relatórios mensais...');

    const mesPassado = subMonths(new Date(), 1);
    const inicio = startOfMonth(mesPassado);
    const fim = endOfMonth(mesPassado);
    const mes = mesPassado.getMonth() + 1;
    const ano = mesPassado.getFullYear();

    // Buscar funcionários que aceitam notificações por email
    const funcionarios = await Funcionario.findAll({
      where: {
        status: 'ATIVO',
        'notificacoes.email': true
      }
    });

    let enviados = 0;
    let erros = 0;

    for (const func of funcionarios) {
      try {
        // Buscar registros do funcionário
        const registros = await RegistroPonto.findAll({
          where: {
            funcionarioId: func.id,
            dataHora: {
              [Op.between]: [inicio, fim]
            }
          },
          order: [['dataHora', 'ASC']]
        });

        if (registros.length === 0) continue;

        // Gerar relatório
        const relatorio = await RelatorioService.gerarRelatorioMensal(
          registros,
          func.id,
          mes,
          ano
        );

        // Gerar PDF
        const pdfBuffer = await RelatorioService.gerarPDF(registros);

        // Enviar por email
        await EmailService.sendMonthlyReport(
          func.email,
          func.nome,
          mes,
          ano,
          pdfBuffer
        );

        enviados++;

      } catch (funcError) {
        logger.error(`Erro ao processar funcionário ${func.id}:`, funcError);
        erros++;
      }
    }

    logger.info(`✅ Relatórios enviados: ${enviados} sucesso, ${erros} erros`);

  } catch (error) {
    logger.error('❌ Erro no envio de relatórios:', error);
  }
}

// Se executado diretamente
if (require.main === module) {
  enviarRelatoriosMensais().then(() => process.exit(0));
}

module.exports = enviarRelatoriosMensais;