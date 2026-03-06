// C:\Projetos\ponto-certo-backend\src\jobs\limparArquivos.js
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { RegistroPonto } = require('../models');
const logger = require('../utils/logger');

async function limparArquivosAntigos() {
  try {
    logger.info('🧹 Iniciando limpeza de arquivos antigos...');

    const dataLimite = new Date();
    dataLimite.setMonth(dataLimite.getMonth() - 3); // 3 meses

    // Buscar registros antigos com foto
    const registrosAntigos = await RegistroPonto.findAll({
      where: {
        dataHora: {
          [Op.lt]: dataLimite
        },
        foto: {
          [Op.ne]: null
        }
      }
    });

    let removidos = 0;

    for (const registro of registrosAntigos) {
      if (registro.foto && fs.existsSync(registro.foto)) {
        try {
          fs.unlinkSync(registro.foto);
          removidos++;
        } catch (fileError) {
          logger.error(`Erro ao remover arquivo ${registro.foto}:`, fileError);
        }
      }
    }

    // Limpar pastas vazias
    const pastas = [
      'uploads/fotos',
      'uploads/biometria',
      'uploads/comprovantes',
      'uploads/relatorios'
    ];

    for (const pasta of pastas) {
      const caminho = path.join(__dirname, '../..', pasta);
      if (fs.existsSync(caminho)) {
        const arquivos = fs.readdirSync(caminho);
        if (arquivos.length === 0) {
          fs.rmdirSync(caminho);
          logger.info(`📁 Pasta removida: ${pasta}`);
        }
      }
    }

    logger.info(`✅ Limpeza concluída: ${removidos} arquivos removidos`);

  } catch (error) {
    logger.error('❌ Erro na limpeza de arquivos:', error);
  }
}

// Se executado diretamente
if (require.main === module) {
  limparArquivosAntigos().then(() => process.exit(0));
}

module.exports = limparArquivosAntigos;