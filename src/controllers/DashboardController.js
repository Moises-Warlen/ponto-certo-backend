// C:\Projetos\ponto-certo-backend\src\controllers\DashboardController.js
const { Empresa, Funcionario, RegistroPonto, Pagamento, sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const { startOfMonth, endOfMonth, subMonths, format } = require('date-fns');

class DashboardController {
  // ========== DASHBOARD MASTER ==========
  async masterDashboard(req, res) {
    try {
      // Totais gerais
      const totalEmpresas = await Empresa.count();
      const empresasAtivas = await Empresa.count({ where: { status: 'ATIVA' } });
      const empresasTeste = await Empresa.count({ where: { status: 'TESTE' } });
      const empresasInadimplentes = await Empresa.count({ where: { status: 'INADIMPLENTE' } });

      // Faturamento
      const faturamentoMes = await Pagamento.sum('valor', {
        where: {
          status: 'PAGO',
          dataPagamento: {
            [Op.gte]: startOfMonth(new Date()),
            [Op.lte]: endOfMonth(new Date())
          }
        }
      });

      const faturamentoAno = await Pagamento.sum('valor', {
        where: {
          status: 'PAGO',
          dataPagamento: {
            [Op.gte]: startOfMonth(new Date(new Date().getFullYear(), 0, 1))
          }
        }
      });

      // Empresas por plano
      const empresasPorPlano = await Empresa.findAll({
        attributes: ['plano', [fn('COUNT', col('plano')), 'total']],
        group: ['plano']
      });

      // Últimas empresas cadastradas
      const ultimasEmpresas = await Empresa.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']]
      });

      // Próximos vencimentos
      const proximosVencimentos = await Pagamento.findAll({
        where: {
          status: 'PENDENTE',
          dataVencimento: {
            [Op.gte]: new Date(),
            [Op.lte]: endOfMonth(new Date())
          }
        },
        include: ['Empresa'],
        limit: 10,
        order: [['dataVencimento', 'ASC']]
      });

      res.json({
        sucesso: true,
        dados: {
          empresas: {
            total: totalEmpresas,
            ativas: empresasAtivas,
            teste: empresasTeste,
            inadimplentes: empresasInadimplentes,
            porPlano: empresasPorPlano,
            ultimas: ultimasEmpresas
          },
          financeiro: {
            faturamentoMes: faturamentoMes || 0,
            faturamentoAno: faturamentoAno || 0,
            proximosVencimentos
          }
        }
      });

    } catch (error) {
      console.error('Erro no dashboard master:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao carregar dashboard'
      });
    }
  }

  // ========== DASHBOARD EMPRESA ==========
  async empresaDashboard(req, res) {
    try {
      const { empresaId } = req.usuario;

      // Funcionários
      const totalFuncionarios = await Funcionario.count({ where: { empresaId } });
      const funcionariosAtivos = await Funcionario.count({
        where: { empresaId, status: 'ATIVO' }
      });
      const funcionariosFerias = await Funcionario.count({
        where: { empresaId, status: 'FERIAS' }
      });

      // Ponto hoje
      const hoje = new Date();
      const registrosHoje = await RegistroPonto.count({
        where: {
          empresaId,
          dataHora: {
            [Op.between]: [
              startOfMonth(hoje),
              endOfMonth(hoje)
            ]
          }
        }
      });

      // Últimos registros
      const ultimosRegistros = await RegistroPonto.findAll({
        where: { empresaId },
        include: ['Funcionario'],
        limit: 10,
        order: [['dataHora', 'DESC']]
      });

      // Funcionários por departamento
      const porDepartamento = await Funcionario.findAll({
        where: { empresaId },
        attributes: ['departamento', [fn('COUNT', col('departamento')), 'total']],
        group: ['departamento']
      });

      // Status financeiro
      const pagamentoAtual = await Pagamento.findOne({
        where: {
          empresaId,
          mes: new Date().getMonth() + 1,
          ano: new Date().getFullYear()
        }
      });

      res.json({
        sucesso: true,
        dados: {
          funcionarios: {
            total: totalFuncionarios,
            ativos: funcionariosAtivos,
            ferias: funcionariosFerias,
            porDepartamento
          },
          ponto: {
            registrosHoje,
            ultimosRegistros
          },
          financeiro: {
            status: pagamentoAtual?.status || 'PENDENTE',
            valor: pagamentoAtual?.valor || 0,
            vencimento: pagamentoAtual?.dataVencimento
          }
        }
      });

    } catch (error) {
      console.error('Erro no dashboard empresa:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao carregar dashboard'
      });
    }
  }

  // ========== DASHBOARD FUNCIONÁRIO ==========
  async funcionarioDashboard(req, res) {
    try {
      const { funcionarioId } = req.usuario;

      // Registros do mês
      const inicioMes = startOfMonth(new Date());
      const fimMes = endOfMonth(new Date());

      const registrosMes = await RegistroPonto.findAll({
        where: {
          funcionarioId,
          dataHora: {
            [Op.between]: [inicioMes, fimMes]
          }
        },
        order: [['dataHora', 'ASC']]
      });

      // Calcular horas trabalhadas no mês
      let horasTrabalhadas = 0;
      let ultimaEntrada = null;

      registrosMes.forEach(reg => {
        if (reg.tipo === 'ENTRADA') {
          ultimaEntrada = reg.dataHora;
        } else if (reg.tipo === 'SAIDA' && ultimaEntrada) {
          const diff = (reg.dataHora - ultimaEntrada) / (1000 * 60 * 60);
          horasTrabalhadas += diff;
          ultimaEntrada = null;
        }
      });

      // Últimos 5 registros
      const ultimosRegistros = await RegistroPonto.findAll({
        where: { funcionarioId },
        limit: 5,
        order: [['dataHora', 'DESC']]
      });

      // Próximas férias
      const proximasFerias = await Ferias.findOne({
        where: {
          funcionarioId,
          status: 'APROVADO',
          dataInicio: {
            [Op.gte]: new Date()
          }
        },
        order: [['dataInicio', 'ASC']]
      });

      // Faltas no mês
      const faltasMes = await Falta.count({
        where: {
          funcionarioId,
          data: {
            [Op.between]: [inicioMes, fimMes]
          }
        }
      });

      res.json({
        sucesso: true,
        dados: {
          resumo: {
            horasTrabalhadas: horasTrabalhadas.toFixed(2),
            registrosHoje: registrosMes.filter(r => 
              format(r.dataHora, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
            ).length,
            faltasMes,
            diasTrabalhados: [...new Set(registrosMes.map(r => 
              format(r.dataHora, 'yyyy-MM-dd')
            ))].length
          },
          ultimosRegistros,
          proximasFerias,
          podeRegistrar: this.podeRegistrarPonto(ultimosRegistros[0])
        }
      });

    } catch (error) {
      console.error('Erro no dashboard funcionário:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao carregar dashboard'
      });
    }
  }

  // ========== VERIFICAR SE PODE REGISTRAR PONTO ==========
  podeRegistrarPonto(ultimoRegistro) {
    if (!ultimoRegistro) return true;

    const agora = new Date();
    const ultimo = new Date(ultimoRegistro.dataHora);
    const diffMinutos = (agora - ultimo) / (1000 * 60);

    // Evitar registros duplicados no mesmo minuto
    if (diffMinutos < 1) return false;

    const tipos = {
      'ENTRADA': 'SAIDA',
      'SAIDA': 'ENTRADA',
      'INTERVALO': 'RETORNO',
      'RETORNO': 'SAIDA'
    };

    return {
      pode: true,
      proximoTipo: tipos[ultimoRegistro.tipo] || 'ENTRADA'
    };
  }
}

module.exports = new DashboardController();