// C:\Projetos\ponto-certo-backend\src\controllers\FeriasController.js
const { Ferias, Funcionario } = require('../models');
const { Op } = require('sequelize');
const { startOfDay, endOfDay, addDays } = require('date-fns');

class FeriasController {
  // ========== SOLICITAR FÉRIAS ==========
  async solicitar(req, res) {
    try {
      const { empresaId } = req.usuario;
      const {
        funcionarioId,
        dataInicio,
        dataFim,
        diasSolicitados,
        diasAbono,
        observacoes
      } = req.body;

      // Validar funcionário
      const funcionario = await Funcionario.findOne({
        where: { id: funcionarioId, empresaId }
      });

      if (!funcionario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Funcionário não encontrado'
        });
      }

      // Verificar se já existe solicitação para o período
      const existe = await Ferias.findOne({
        where: {
          funcionarioId,
          [Op.or]: [
            {
              dataInicio: {
                [Op.between]: [dataInicio, dataFim]
              }
            },
            {
              dataFim: {
                [Op.between]: [dataInicio, dataFim]
              }
            }
          ]
        }
      });

      if (existe) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Já existe uma solicitação de férias para este período'
        });
      }

      // Calcular período aquisitivo
      const dataAdmissao = funcionario.dataAdmissao;
      const periodoAquisitivoInicio = new Date(dataAdmissao);
      const periodoAquisitivoFim = addDays(periodoAquisitivoInicio, 365);

      // Calcular valores
      const salario = funcionario.salario || 0;
      const valorDiario = salario / 30;
      const valorFerias = valorDiario * diasSolicitados;
      const valorTerco = valorFerias / 3;
      const valorAbono = diasAbono ? valorDiario * diasAbono : 0;
      const valorTotal = valorFerias + valorTerco + valorAbono;

      // Criar solicitação
      const ferias = await Ferias.create({
        empresaId,
        funcionarioId,
        periodoAquisitivoInicio,
        periodoAquisitivoFim,
        dataInicio,
        dataFim,
        diasSolicitados,
        diasAbono: diasAbono || 0,
        valorAbono,
        valorTerco,
        valorTotal,
        observacoes,
        status: 'AGENDADO'
      });

      res.status(201).json({
        sucesso: true,
        mensagem: 'Férias solicitadas com sucesso',
        dados: ferias
      });

    } catch (error) {
      console.error('Erro ao solicitar férias:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao solicitar férias'
      });
    }
  }

  // ========== APROVAR FÉRIAS ==========
  async aprovar(req, res) {
    try {
      const { id } = req.params;
      const { id: usuarioId } = req.usuario;

      const ferias = await Ferias.findByPk(id);

      if (!ferias) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Solicitação não encontrada'
        });
      }

      if (ferias.status !== 'AGENDADO') {
        return res.status(400).json({
          sucesso: false,
          erro: 'Esta solicitação não pode ser aprovada'
        });
      }

      ferias.status = 'APROVADO';
      ferias.aprovadoPor = usuarioId;
      ferias.dataAprovacao = new Date();
      await ferias.save();

      // Atualizar status do funcionário
      await Funcionario.update(
        { status: 'FERIAS' },
        { where: { id: ferias.funcionarioId } }
      );

      res.json({
        sucesso: true,
        mensagem: 'Férias aprovadas com sucesso',
        dados: ferias
      });

    } catch (error) {
      console.error('Erro ao aprovar férias:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao aprovar férias'
      });
    }
  }

  // ========== REJEITAR FÉRIAS ==========
  async rejeitar(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      const ferias = await Ferias.findByPk(id);

      if (!ferias) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Solicitação não encontrada'
        });
      }

      if (ferias.status !== 'AGENDADO') {
        return res.status(400).json({
          sucesso: false,
          erro: 'Esta solicitação não pode ser rejeitada'
        });
      }

      ferias.status = 'CANCELADO';
      ferias.observacoes = motivo;
      await ferias.save();

      res.json({
        sucesso: true,
        mensagem: 'Férias rejeitadas',
        dados: ferias
      });

    } catch (error) {
      console.error('Erro ao rejeitar férias:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao rejeitar férias'
      });
    }
  }

  // ========== LISTAR FÉRIAS ==========
  async listar(req, res) {
    try {
      const { empresaId } = req.usuario;
      const { funcionarioId, status, inicio, fim, page = 1, limit = 10 } = req.query;

      const where = { empresaId };

      if (funcionarioId) where.funcionarioId = funcionarioId;
      if (status) where.status = status;
      if (inicio && fim) {
        where.dataInicio = {
          [Op.between]: [inicio, fim]
        };
      }

      const offset = (page - 1) * limit;

      const ferias = await Ferias.findAndCountAll({
        where,
        include: [{
          model: Funcionario,
          attributes: ['id', 'nome', 'matricula', 'departamento']
        }],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        sucesso: true,
        total: ferias.count,
        pagina: page,
        dados: ferias.rows
      });

    } catch (error) {
      console.error('Erro ao listar férias:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao listar férias'
      });
    }
  }

  // ========== MINHAS FÉRIAS ==========
  async minhasFerias(req, res) {
    try {
      const { funcionarioId } = req.usuario;

      const ferias = await Ferias.findAll({
        where: { funcionarioId },
        include: [{
          model: Funcionario,
          attributes: ['id', 'nome', 'matricula']
        }],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        sucesso: true,
        dados: ferias
      });

    } catch (error) {
      console.error('Erro ao buscar férias:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao buscar férias'
      });
    }
  }

  // ========== RELATÓRIO DE FÉRIAS ==========
  async relatorio(req, res) {
    try {
      const { empresaId } = req.usuario;
      const { ano } = req.query;

      const anoFiltro = ano || new Date().getFullYear();

      const ferias = await Ferias.findAll({
        where: {
          empresaId,
          [Op.or]: [
            sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM "dataInicio"')), anoFiltro),
            sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM "dataFim"')), anoFiltro)
          ]
        },
        include: [{
          model: Funcionario,
          attributes: ['id', 'nome', 'departamento']
        }]
      });

      const resumo = {
        totalSolicitacoes: ferias.length,
        aprovadas: ferias.filter(f => f.status === 'APROVADO').length,
        agendadas: ferias.filter(f => f.status === 'AGENDADO').length,
        realizadas: ferias.filter(f => f.status === 'REALIZADO').length,
        canceladas: ferias.filter(f => f.status === 'CANCELADO').length,
        totalDias: ferias.reduce((acc, f) => acc + f.diasSolicitados, 0),
        totalValor: ferias.reduce((acc, f) => acc + parseFloat(f.valorTotal || 0), 0)
      };

      res.json({
        sucesso: true,
        ano: anoFiltro,
        resumo,
        dados: ferias
      });

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao gerar relatório'
      });
    }
  }
}

module.exports = new FeriasController();