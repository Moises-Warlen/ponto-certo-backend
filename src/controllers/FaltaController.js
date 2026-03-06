// C:\Projetos\ponto-certo-backend\src\controllers\FaltaController.js
const { Falta, Funcionario, RegistroPonto } = require('../models');
const { Op } = require('sequelize');

class FaltaController {
  // ========== REGISTRAR FALTA ==========
  async registrar(req, res) {
    try {
      const { empresaId } = req.usuario;
      const {
        funcionarioId,
        data,
        tipo,
        justificativa,
        descontar
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

      // Verificar se já existe falta para esta data
      const existe = await Falta.findOne({
        where: {
          funcionarioId,
          data
        }
      });

      if (existe) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Falta já registrada para esta data'
        });
      }

      // Verificar se tem registro de ponto no dia
      const temRegistro = await RegistroPonto.findOne({
        where: {
          funcionarioId,
          dataHora: {
            [Op.between]: [
              new Date(data + 'T00:00:00'),
              new Date(data + 'T23:59:59')
            ]
          }
        }
      });

      const falta = await Falta.create({
        empresaId,
        funcionarioId,
        data,
        tipo: tipo || 'FALTA',
        justificativa,
        descontar: descontar !== undefined ? descontar : !temRegistro,
        justificada: !!justificativa
      });

      res.status(201).json({
        sucesso: true,
        mensagem: 'Falta registrada com sucesso',
        dados: falta
      });

    } catch (error) {
      console.error('Erro ao registrar falta:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao registrar falta'
      });
    }
  }

  // ========== JUSTIFICAR FALTA ==========
  async justificar(req, res) {
    try {
      const { id } = req.params;
      const { justificativa, atestado } = req.body;

      const falta = await Falta.findByPk(id);

      if (!falta) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Falta não encontrada'
        });
      }

      falta.justificativa = justificativa;
      falta.justificada = true;
      falta.dataJustificativa = new Date();
      falta.tipo = 'JUSTIFICADA';
      falta.descontar = false;

      if (atestado) {
        falta.atestado = atestado;
      }

      await falta.save();

      res.json({
        sucesso: true,
        mensagem: 'Falta justificada com sucesso',
        dados: falta
      });

    } catch (error) {
      console.error('Erro ao justificar falta:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao justificar falta'
      });
    }
  }

  // ========== LISTAR FALTAS ==========
  async listar(req, res) {
    try {
      const { empresaId } = req.usuario;
      const { funcionarioId, dataInicio, dataFim, page = 1, limit = 10 } = req.query;

      const where = { empresaId };

      if (funcionarioId) where.funcionarioId = funcionarioId;
      if (dataInicio && dataFim) {
        where.data = {
          [Op.between]: [dataInicio, dataFim]
        };
      }

      const offset = (page - 1) * limit;

      const faltas = await Falta.findAndCountAll({
        where,
        include: [{
          model: Funcionario,
          attributes: ['id', 'nome', 'matricula', 'departamento']
        }],
        limit,
        offset,
        order: [['data', 'DESC']]
      });

      res.json({
        sucesso: true,
        total: faltas.count,
        pagina: page,
        dados: faltas.rows
      });

    } catch (error) {
      console.error('Erro ao listar faltas:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao listar faltas'
      });
    }
  }

  // ========== MINHAS FALTAS ==========
  async minhasFaltas(req, res) {
    try {
      const { funcionarioId } = req.usuario;

      const faltas = await Falta.findAll({
        where: { funcionarioId },
        include: [{
          model: Funcionario,
          attributes: ['id', 'nome', 'matricula']
        }],
        order: [['data', 'DESC']]
      });

      res.json({
        sucesso: true,
        dados: faltas
      });

    } catch (error) {
      console.error('Erro ao buscar faltas:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao buscar faltas'
      });
    }
  }

  // ========== RELATÓRIO DE FALTAS ==========
  async relatorio(req, res) {
    try {
      const { empresaId } = req.usuario;
      const { mes, ano } = req.query;

      const mesFiltro = mes || new Date().getMonth() + 1;
      const anoFiltro = ano || new Date().getFullYear();

      const dataInicio = new Date(anoFiltro, mesFiltro - 1, 1);
      const dataFim = new Date(anoFiltro, mesFiltro, 0);

      const faltas = await Falta.findAll({
        where: {
          empresaId,
          data: {
            [Op.between]: [dataInicio, dataFim]
          }
        },
        include: [{
          model: Funcionario,
          attributes: ['id', 'nome', 'departamento']
        }]
      });

      const resumo = {
        totalFaltas: faltas.length,
        justificadas: faltas.filter(f => f.justificada).length,
        naoJustificadas: faltas.filter(f => !f.justificada).length,
        abonadas: faltas.filter(f => f.tipo === 'ABONADA').length,
        comAtestado: faltas.filter(f => f.atestado).length,
        funcionarios: [...new Set(faltas.map(f => f.funcionarioId))].length
      };

      res.json({
        sucesso: true,
        mes: mesFiltro,
        ano: anoFiltro,
        resumo,
        dados: faltas
      });

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao gerar relatório'
      });
    }
  }

  // ========== EXCLUIR FALTA ==========
  async excluir(req, res) {
    try {
      const { id } = req.params;

      const falta = await Falta.findByPk(id);

      if (!falta) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Falta não encontrada'
        });
      }

      await falta.destroy();

      res.json({
        sucesso: true,
        mensagem: 'Falta excluída com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir falta:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao excluir falta'
      });
    }
  }
}

module.exports = new FaltaController();