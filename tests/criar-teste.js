// C:\Projetos\ponto-certo-backend\scripts\criar-teste.js
require('dotenv').config();
const { sequelize, Empresa, Usuario, Funcionario, RegistroPonto } = require('../src/models');
const { addDays, subDays, setHours, setMinutes } = require('date-fns');

async function criarDadosTeste() {
  try {
    console.log('='.repeat(50));
    console.log('🚀 PONTO-CERTO - Criando Dados de Teste');
    console.log('='.repeat(50));
    console.log('');

    await sequelize.authenticate();
    console.log('✅ Conectado ao banco\n');

    // Buscar empresa de teste
    const empresa = await Empresa.findOne({ where: { cnpj: '11111111111111' } });

    if (!empresa) {
      console.log('❌ Empresa de teste não encontrada. Execute primeiro: npm run seed:admin');
      process.exit(1);
    }

    console.log(`🏢 Empresa: ${empresa.nomeFantasia}\n`);

    // Criar funcionários de teste
    const funcionarios = [];
    const nomes = [
      'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Souza',
      'Carlos Lima', 'Julia Costa', 'Roberto Alves', 'Fernanda Rocha'
    ];
    const departamentos = ['Vendas', 'TI', 'RH', 'Financeiro', 'Marketing'];

    for (let i = 0; i < nomes.length; i++) {
      const cpf = `${10000000000 + i}`.padStart(11, '0');
      
      const [funcionario] = await Funcionario.findOrCreate({
        where: { cpf },
        defaults: {
          empresaId: empresa.id,
          nome: nomes[i],
          cpf,
          email: `funcionario${i + 1}@teste.com`,
          celular: `1199999${(1000 + i).toString().slice(1)}`,
          dataNascimento: new Date(1980 + i, i % 12, i + 1),
          departamento: departamentos[i % departamentos.length],
          cargo: i % 2 === 0 ? 'Analista' : 'Assistente',
          dataAdmissao: subDays(new Date(), 30 * (i + 1)),
          salario: 2500 + (i * 300),
          cargaHorariaSemanal: 44,
          horarioEntrada: '08:00',
          horarioSaida: '18:00',
          status: 'ATIVO'
        }
      });

      funcionarios.push(funcionario);

      // Criar usuário para acesso
      await Usuario.findOrCreate({
        where: { email: funcionario.email },
        defaults: {
          empresaId: empresa.id,
          funcionarioId: funcionario.id,
          nome: funcionario.nome,
          email: funcionario.email,
          senha: '123456',
          tipo: 'FUNCIONARIO',
          ativo: true
        }
      });

      console.log(`✅ Funcionário criado: ${funcionario.nome}`);
    }

    console.log('\n📝 Criando registros de ponto dos últimos 30 dias...');

    // Criar registros de ponto
    for (const func of funcionarios) {
      for (let dia = 0; dia < 30; dia++) {
        const data = subDays(new Date(), dia);
        
        // Pular fins de semana
        if (data.getDay() === 0 || data.getDay() === 6) continue;

        // Horário de entrada (08:00 - 09:00)
        const entrada = setHours(setMinutes(data, Math.floor(Math.random() * 30)), 8);
        
        // Horário de saída (17:00 - 19:00)
        const saida = setHours(setMinutes(data, Math.floor(Math.random() * 30)), 17 + Math.floor(Math.random() * 2));

        await RegistroPonto.create({
          empresaId: empresa.id,
          funcionarioId: func.id,
          tipo: 'ENTRADA',
          dataHora: entrada,
          metodo: 'WEB',
          ip: '127.0.0.1',
          valido: true
        });

        await RegistroPonto.create({
          empresaId: empresa.id,
          funcionarioId: func.id,
          tipo: 'SAIDA',
          dataHora: saida,
          metodo: 'WEB',
          ip: '127.0.0.1',
          valido: true
        });
      }
      console.log(`   ${func.nome}: 30 dias de registros criados`);
    }

    console.log('\n');
    console.log('='.repeat(50));
    console.log('🎉 DADOS DE TESTE CRIADOS COM SUCESSO!');
    console.log('='.repeat(50));
    console.log('');
    console.log('📱 ACESSOS PARA TESTE:');
    console.log('');
    funcionarios.slice(0, 3).forEach(f => {
      console.log(`   ${f.nome}: ${f.email} / 123456`);
    });
    console.log('');
    console.log('🚀 Use essas credenciais para testar o sistema!');
    console.log('');

    process.exit(0);

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

criarDadosTeste();