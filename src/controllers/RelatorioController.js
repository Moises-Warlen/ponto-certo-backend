// C:\Projetos\ponto-certo-backend\src\controllers\RelatorioController.js
const { RegistroPonto, Funcionario } = require('../models');
const { Op } = require('sequelize');
const { startOfMonth, endOfMonth, format, parse } = require('date-fns');
const RelatorioService = require('../services/RelatorioService');

class RelatorioController {
  // ========== MEU RELATÓRIO ==========
  async meuRelatorio(req, res) {
    try {
      const { funcionarioId, empresaId } = req.usuario;
      const { mes, ano } = req.query;

      const data = new Date(ano, mes - 1, 1);
      const inicio = startOfMonth(data);
      const fim = endOfMonth(data);

      const registros = await RegistroPonto.findAll({
        where: {
          funcionarioId,
          empresaId,
          dataHora: {
            [Op.between]: [inicio, fim]
          }
        },
        order: [['dataHora', 'ASC']]
      });

      const relatorio = await RelatorioService.gerarRelatorioMensal(
        registros,
        funcionarioId,
        mes,
        ano
      );

      res.json({
        sucesso: true,
        dados: relatorio
      });

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao gerar relatório'
      });
    }
  }

  // ========== RELATÓRIO DO DEPARTAMENTO ==========
  async relatorioDepartamento(req, res) {
    try {
      const { empresaId, funcionarioId } = req.usuario;
      const { mes, ano } = req.query;

      // Buscar funcionário logado
      const funcionario = await Funcionario.findByPk(funcionarioId);

      if (!funcionario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Funcionário não encontrado'
        });
      }

      // Buscar funcionários do mesmo departamento
      const funcionarios = await Funcionario.findAll({
        where: {
          empresaId,
          departamento: funcionario.departamento
        },
        attributes: ['id', 'nome', 'matricula']
      });

      const data = new Date(ano, mes - 1, 1);
      const inicio = startOfMonth(data);
      const fim = endOfMonth(data);

      const relatorios = [];

      for (const func of funcionarios) {
        const registros = await RegistroPonto.findAll({
          where: {
            funcionarioId: func.id,
            empresaId,
            dataHora: {
              [Op.between]: [inicio, fim]
            }
          },
          order: [['dataHora', 'ASC']]
        });

        const relatorio = await RelatorioService.gerarRelatorioMensal(
          registros,
          func.id,
          mes,
          ano
        );

        relatorios.push({
          funcionario: {
            id: func.id,
            nome: func.nome,
            matricula: func.matricula
          },
          ...relatorio
        });
      }

      res.json({
        sucesso: true,
        dados: relatorios
      });

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao gerar relatório'
      });
    }
  }

  // ========== RELATÓRIO GERAL ==========
  async relatorioGeral(req, res) {
    try {
      const { empresaId } = req.usuario;
      const { mes, ano } = req.query;

      const data = new Date(ano, mes - 1, 1);
      const inicio = startOfMonth(data);
      const fim = endOfMonth(data);

      const funcionarios = await Funcionario.findAll({
        where: { empresaId },
        attributes: ['id', 'nome', 'matricula', 'departamento', 'cargo', 'status']
      });

      const relatorios = [];

      for (const func of funcionarios) {
        const registros = await RegistroPonto.findAll({
          where: {
            funcionarioId: func.id,
            empresaId,
            dataHora: {
              [Op.between]: [inicio, fim]
            }
          },
          order: [['dataHora', 'ASC']]
        });

        const relatorio = await RelatorioService.gerarRelatorioMensal(
          registros,
          func.id,
          mes,
          ano
        );

        relatorios.push({
          funcionario: {
            id: func.id,
            nome: func.nome,
            matricula: func.matricula,
            departamento: func.departamento,
            cargo: func.cargo,
            status: func.status
          },
          ...relatorio
        });
      }

      // Resumo geral
      const resumo = {
        totalFuncionarios: funcionarios.length,
        totalHoras: relatorios.reduce((acc, r) => acc + (r.totalHoras || 0), 0),
        totalExtras: relatorios.reduce((acc, r) => acc + (r.totalExtras || 0), 0),
        totalFaltas: relatorios.reduce((acc, r) => acc + (r.totalFaltas || 0), 0),
        mediaHoras: 0
      };

      if (funcionarios.length > 0) {
        resumo.mediaHoras = resumo.totalHoras / funcionarios.length;
      }

      res.json({
        sucesso: true,
        resumo,
        dados: relatorios
      });

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao gerar relatório'
      });
    }
  }

  // ========== EXPORTAR RELATÓRIO ==========
  async exportar(req, res) {
    try {
      const { empresaId } = req.usuario;
      const { tipo, formato, funcionarioId, inicio, fim } = req.query;

      let dados;

      if (tipo === 'individual' && funcionarioId) {
        const registros = await RegistroPonto.findAll({
          where: {
            funcionarioId,
            empresaId,
            dataHora: {
              [Op.between]: [new Date(inicio), new Date(fim)]
            }
          },
          include: ['Funcionario'],
          order: [['dataHora', 'ASC']]
        });
        dados = registros;
      } else {
        const registros = await RegistroPonto.findAll({
          where: {
            empresaId,
            dataHora: {
              [Op.between]: [new Date(inicio), new Date(fim)]
            }
          },
          include: ['Funcionario'],
          order: [['dataHora', 'ASC']]
        });
        dados = registros;
      }

      let buffer;
      let filename;
      let contentType;

      if (formato === 'pdf') {
        buffer = await RelatorioService.gerarPDF(dados);
        filename = `relatorio_${Date.now()}.pdf`;
        contentType = 'application/pdf';
      } else {
        buffer = await RelatorioService.gerarExcel(dados);
        filename = `relatorio_${Date.now()}.xlsx`;
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);

    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao exportar relatório'
      });
    }
  }

  // ========== IMPRIMIR COMPROVANTE ==========
  async imprimir(req, res) {
    try {
      const { id } = req.params;
      const { empresaId } = req.usuario;

      const registro = await RegistroPonto.findOne({
        where: { id, empresaId },
        include: ['Funcionario']
      });

      if (!registro) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Registro não encontrado'
        });
      }

      const pdfBuffer = await RelatorioService.gerarComprovante(registro);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="comprovante_${id}.pdf"`);
      res.send(pdfBuffer);

    } catch (error) {
      console.error('Erro ao imprimir comprovante:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao imprimir comprovante'
      });
    }
  }
}

module.exports = new RelatorioController();