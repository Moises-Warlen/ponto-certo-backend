// scripts/criar-admin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();
const prisma = new PrismaClient();

async function criarAdmin() {
  try {
    console.log('='.repeat(50));
    console.log('🚀 PONTO-CERTO - Criando Administrador');
    console.log('='.repeat(50));
    console.log('');

    // Criar empresa Master
    console.log('🏢 Criando empresa Master...');
    const empresa = await prisma.empresa.upsert({
      where: { cnpj: '00000000000000' },
      update: {},
      create: {
        razaoSocial: 'Ponto-Certo Sistemas Ltda',
        nomeFantasia: 'Ponto-Certo',
        cnpj: '00000000000000',
        email: 'contato@ponto-certo.com',
        telefone: '11999999999',
        plano: 'ENTERPRISE',
        limiteFuncionarios: 999999,
        valorMensal: 0,
        status: 'ATIVA',
        corPrimaria: '#4361ee',
        corSecundaria: '#3f37c9'
      }
    });
    console.log('✅ Empresa Master criada\n');

    // Criar usuário admin
    console.log('👤 Criando administrador...');
    const senhaHash = await bcrypt.hash(process.env.ADMIN_SENHA, 10);

    const admin = await prisma.usuario.upsert({
      where: { email: process.env.ADMIN_EMAIL },
      update: {},
      create: {
        empresaId: empresa.id,
        nome: process.env.ADMIN_NOME,
        email: process.env.ADMIN_EMAIL,
        senha: senhaHash,
        tipo: 'MASTER',
        ativo: true,
        permissoes: {
          registrarProprioPonto: true,
          registrarPontoOutros: true,
          visualizarPropriosRegistros: true,
          visualizarRegistrosDepartamento: true,
          visualizarRegistrosGeral: true,
          editarRegistros: true,
          excluirRegistros: true,
          visualizarFuncionarios: true,
          cadastrarFuncionario: true,
          editarFuncionario: true,
          excluirFuncionario: true,
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
          gerenciarPermissoes: true,
          visualizarFinanceiro: true,
          gerenciarAssinatura: true
        }
      }
    });
    console.log('✅ Administrador criado:');
    console.log(`   Email: ${process.env.ADMIN_EMAIL}`);
    console.log(`   Senha: ${process.env.ADMIN_SENHA}\n`);

    // Criar empresa de teste
    console.log('🏢 Criando empresa de teste...');
    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + 7);

    const empresaTeste = await prisma.empresa.upsert({
      where: { cnpj: '11111111111111' },
      update: {},
      create: {
        razaoSocial: 'Empresa Teste Ltda',
        nomeFantasia: 'Empresa Teste',
        cnpj: '11111111111111',
        email: 'teste@empresa.com',
        telefone: '11988887777',
        plano: 'BASICO',
        limiteFuncionarios: 10,
        valorMensal: 97.00,
        status: 'TESTE',
        dataExpiracaoTeste: dataExpiracao
      }
    });
    console.log('✅ Empresa de teste criada (válida por 7 dias)\n');

    // Criar admin da empresa teste
    console.log('👤 Criando admin da empresa teste...');
    const senhaTesteHash = await bcrypt.hash('@1q2w3e4r@', 10);

    const adminTeste = await prisma.usuario.upsert({
      where: { email: 'admin@teste.com' },
      update: {},
      create: {
        empresaId: empresaTeste.id,
        nome: 'Admin Teste',
        email: 'admin@teste.com',
        senha: senhaTesteHash,
        tipo: 'ADMIN_EMPRESA',
        ativo: true,
        permissoes: {
          registrarProprioPonto: true,
          registrarPontoOutros: true,
          visualizarPropriosRegistros: true,
          visualizarRegistrosDepartamento: true,
          visualizarRegistrosGeral: true,
          visualizarFuncionarios: true,
          cadastrarFuncionario: true,
          editarFuncionario: true,
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
          gerenciarUsuarios: true
        }
      }
    });
    console.log('✅ Admin da empresa teste criado\n');

    console.log('='.repeat(50));
    console.log('🎉 SISTEMA CONFIGURADO COM SUCESSO!');
    console.log('='.repeat(50));
    console.log('');
    console.log('📱 ACESSOS:');
    console.log('');
    console.log('   Administrador Master:');
    console.log(`   Email: ${process.env.ADMIN_EMAIL}`);
    console.log(`   Senha: ${process.env.ADMIN_SENHA}`);
    console.log('');
    console.log('   Empresa Teste (7 dias):');
    console.log('   Email: admin@teste.com');
    console.log('   Senha: @1q2w3e4r@');
    console.log('');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

criarAdmin();