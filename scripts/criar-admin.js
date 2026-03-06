// scripts/criar-admin.js
require('dotenv').config();
const { sequelize, Empresa, Usuario } = require('../src/models');

async function criarAdmin() {
  try {
    console.log('='.repeat(50));
    console.log('🚀 PONTO-CERTO - Criando Administrador');
    console.log('='.repeat(50));

    await sequelize.authenticate();
    console.log('✅ Conectado ao banco');

    // Criar empresa Master
    const [empresa] = await Empresa.findOrCreate({
      where: { cnpj: '00000000000000' },
      defaults: {
        razaoSocial: 'Ponto-Certo Sistemas',
        nomeFantasia: 'Ponto-Certo',
        cnpj: '00000000000000',
        email: 'contato@ponto-certo.com',
        telefone: '11999999999',
        plano: 'ENTERPRISE',
        status: 'ATIVA'
      }
    });

    // Criar admin
    const [admin] = await Usuario.findOrCreate({
      where: { email: process.env.ADMIN_EMAIL },
      defaults: {
        empresaId: empresa.id,
        nome: process.env.ADMIN_NOME,
        email: process.env.ADMIN_EMAIL,
        senha: process.env.ADMIN_SENHA,
        tipo: 'MASTER',
        ativo: true,
        permissoes: { todas: true }
      }
    });

    console.log('✅ Administrador criado:');
    console.log(`   Email: ${process.env.ADMIN_EMAIL}`);
    console.log(`   Senha: ${process.env.ADMIN_SENHA}`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

criarAdmin();