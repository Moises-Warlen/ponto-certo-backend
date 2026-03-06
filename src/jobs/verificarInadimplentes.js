// C:\Projetos\ponto-certo-backend\src\jobs\verificarInadimplentes.js
const { Empresa, Pagamento } = require('../models');
const { Op } = require('sequelize');
const EmailService = require('../services/EmailService');
const logger = require('../utils/logger');

async function verificarInadimplentes() {
  try {
    logger.info('🔍 Iniciando verificação de inadimplentes...');

    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    // Buscar empresas com pagamento pendente do mês atual
    const empresas = await Empresa.findAll({
      where: {
        status: ['ATIVA', 'TESTE'],
        [Op.or]: [
          { '$Pagamentos.mes$': mesAtual, '$Pagamentos.ano$': anoAtual },
          { '$Pagamentos.id$': null }
        ]
      },
      include: [{
        model: Pagamento,
        required: false,
        where: {
          mes: mesAtual,
          ano: anoAtual
        }
      }]
    });

    let atualizadas = 0;
    let notificacoes = 0;

    for (const empresa of empresas) {
      const pagamento = empresa.Pagamentos?.[0];

      // Se não tem pagamento ou está pendente há mais de 5 dias
      if (!pagamento || pagamento.status === 'PENDENTE') {
        const diasAtraso = pagamento ? pagamento.diasAtraso() : 0;

        if (diasAtraso >= 5) {
          // Suspender empresa
          empresa.status = 'INADIMPLENTE';
          await empresa.save();
          atualizadas++;

          // Notificar admin
          try {
            await EmailService.sendPaymentAlert(
              empresa.email,
              empresa.nomeFantasia,
              diasAtraso
            );
            notificacoes++;
          } catch (emailError) {
            logger.error(`Erro ao enviar email para ${empresa.email}:`, emailError);
          }
        }
      }
    }

    logger.info(`✅ Verificação concluída: ${atualizadas} empresas suspensas, ${notificacoes} notificações enviadas`);

  } catch (error) {
    logger.error('❌ Erro na verificação de inadimplentes:', error);
  }
}

// Se executado diretamente
if (require.main === module) {
  verificarInadimplentes().then(() => process.exit(0));
}

module.exports = verificarInadimplentes;