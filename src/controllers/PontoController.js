// C:\Projetos\ponto-certo-backend\src\controllers\PontoController.js
const { RegistroPonto, Funcionario } = require('../models');
const { Op } = require('sequelize');
const { startOfDay, endOfDay, format } = require('date-fns');
const BiometriaService = require('../services/BiometriaService');
const EmailService = require('../services/EmailService');
const RelatorioService = require('../services/RelatorioService');

class PontoController {
  // ========== REGISTRAR PONTO ==========
  async registrar(req, res) {
    try {
      const { empresaId, id: usuarioId, funcionarioId: usuarioFuncId } = req.usuario;
      const { tipo, latitude, longitude, observacao, funcionarioId: bodyFuncId } = req.body;

      // Determinar qual funcionário está registrando
      let funcionarioId = bodyFuncId || usuarioFuncId;

      if (!funcionarioId) {
        return res.status(400).json({
          sucesso: false,
          erro: 'ID do funcionário não informado'
        });
      }

      // Buscar funcionário
      const funcionario = await Funcionario.findOne({
        where: { id: funcionarioId, empresaId }
      });

      if (!funcionario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Funcionário não encontrado'
        });
      }

      if (!funcionario.estaAtivo()) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Funcionário não está ativo'
        });
      }

      // Verificar biometria se houver foto
      let pontuacaoFacial = null;
      let livenessScore = null;

      if (req.file) {
        try {
          const biometria = await BiometriaService.verificarIdentidade(
            funcionarioId,
            req.file.path,
            funcionario.fotosBiometria
          );

          pontuacaoFacial = biometria.pontuacao;
          livenessScore = biometria.livenessScore;

          if (!biometria.verificado) {
            return res.status(400).json({
              sucesso: false,
              erro: 'Biometria não confirmada',
              pontuacao: biometria.pontuacao
            });
          }
        } catch (bioError) {
          console.error('Erro na biometria:', bioError);
        }
      }

      // Criar registro
      const registro = await RegistroPonto.create({
        empresaId,
        funcionarioId,
        tipo,
        dataHora: new Date(),
        latitude,
        longitude,
        observacao,
        foto: req.file?.path,
        pontuacaoFacial,
        livenessScore,
        metodo: req.file ? 'FACIAL' : 'WEB',
        ip: req.ip,
        dispositivo: req.headers['user-agent'],
        userAgent: JSON.stringify(req.headers)
      });

      // Enviar notificação por email se configurado
      if (funcionario.notificacoes?.email) {
        try {
          await EmailService.sendTimeRecord(
            funcionario.email,
            funcionario.nome,
            registro.dataHora,
            registro.tipo
          );
        } catch (emailError) {
          console.error('Erro ao enviar email:', emailError);
        }
      }

      res.status(201).json({
        sucesso: true,
        mensagem: 'Ponto registrado com sucesso',
        dados: {
          id: registro.id,
          tipo: registro.tipo,
          dataHora: registro.dataHora,
          pontuacaoFacial
        }
      });

    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao registrar ponto'
      });
    }
  }

  // ========== REGISTRAR PONTO DE OUTRO FUNCIONÁRIO ==========
  async registrarOutro(req, res) {
    try {
      const { empresaId } = req.usuario;
      const { funcionarioId, tipo, latitude, longitude, observacao } = req.body;

      if (!funcionarioId) {
        return res.status(400).json({
          sucesso: false,
          erro: 'ID do funcionário é obrigatório'
        });
      }

      const funcionario = await Funcionario.findOne({
        where: { id: funcionarioId, empresaId }
      });

      if (!funcionario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Funcionário não encontrado'
        });
      }

      const registro = await RegistroPonto.create({
        empresaId,
        funcionarioId,
        tipo,
        dataHora: new Date(),
        latitude,
        longitude,
        observacao,
        metodo: 'MANUAL',
        ip: req.ip,
        dispositivo: req.headers['user-agent']
      });

      res.status(201).json({
        sucesso: true,
        mensagem: 'Ponto registrado com sucesso',
        dados: registro
      });

    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao registrar ponto'
      });
    }
  }

  // ========== MEUS REGISTROS ==========
  async meusRegistros(req, res) {
    try {
      const { funcionarioId, empresaId } = req.usuario;
      const { data, inicio, fim, page = 1, limit = 30 } = req.query;

      let where = {
        funcionarioId,
        empresaId
      };

      // Filtro por data específica
      if (data) {
        const dataFiltro = new Date(data);
        where.dataHora = {
          [Op.between]: [
            startOfDay(dataFiltro),
            endOfDay(dataFiltro)
          ]
        };
      }

      // Filtro por período
      if (inicio && fim) {
        where.dataHora = {
          [Op.between]: [
            startOfDay(new Date(inicio)),
            endOfDay(new Date(fim))
          ]
        };
      }

      const offset = (page - 1) * limit;

      const registros = await RegistroPonto.findAndCountAll({
        where,
        order: [['dataHora', 'DESC']],
        limit,
        offset
      });

      res.json({
        sucesso: true,
        total: registros.count,
        pagina: page,
        dados: registros.rows
      });

    } catch (error) {
      console.error('Erro ao buscar registros:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao buscar registros'
      });
    }
  }

  // ========== REGISTROS DO DEPARTAMENTO ==========
  async registrosDepartamento(req, res) {
    try {
      const { empresaId, funcionarioId } = req.usuario;
      const { data } = req.query;

      // Buscar funcionário logado para pegar departamento
      const funcionario = await Funcionario.findByPk(funcionarioId);

      if (!funcionario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Funcionário não encontrado'
        });
      }

      // Buscar funcionários do mesmo departamento
      const funcionariosDept = await Funcionario.findAll({
        where: {
          empresaId,
          departamento: funcionario.departamento
        },
        attributes: ['id', 'nome']
      });

      const funcionarioIds = funcionariosDept.map(f => f.id);

      let where = {
        funcionarioId: { [Op.in]: funcionarioIds },
        empresaId
      };

      if (data) {
        const dataFiltro = new Date(data);
        where.dataHora = {
          [Op.between]: [
            startOfDay(dataFiltro),
            endOfDay(dataFiltro)
          ]
        };
      }

      const registros = await RegistroPonto.findAll({
        where,
        include: [{
          model: Funcionario,
          attributes: ['id', 'nome', 'departamento']
        }],
        order: [['dataHora', 'DESC']]
      });

      res.json({
        sucesso: true,
        dados: registros
      });

    } catch (error) {
      console.error('Erro ao buscar registros:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao buscar registros'
      });
    }
  }

  // ========== REGISTROS GERAIS ==========
  async registrosGeral(req, res) {
    try {
      const { empresaId } = req.usuario;
      const { data, funcionarioId, page = 1, limit = 50 } = req.query;

      let where = { empresaId };

      if (funcionarioId) {
        where.funcionarioId = funcionarioId;
      }

      if (data) {
        const dataFiltro = new Date(data);
        where.dataHora = {
          [Op.between]: [
            startOfDay(dataFiltro),
            endOfDay(dataFiltro)
          ]
        };
      }

      const offset = (page - 1) * limit;

      const registros = await RegistroPonto.findAndCountAll({
        where,
        include: [{
          model: Funcionario,
          attributes: ['id', 'nome', 'departamento', 'cargo']
        }],
        order: [['dataHora', 'DESC']],
        limit,
        offset
      });

      res.json({
        sucesso: true,
        total: registros.count,
        pagina: page,
        dados: registros.rows
      });

    } catch (error) {
      console.error('Erro ao buscar registros:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao buscar registros'
      });
    }
  }

  // ========== REGISTROS DE HOJE ==========
  async registrosHoje(req, res) {
    try {
      const { empresaId } = req.usuario;

      const hoje = new Date();

      const registros = await RegistroPonto.findAll({
        where: {
          empresaId,
          dataHora: {
            [Op.between]: [startOfDay(hoje), endOfDay(hoje)]
          }
        },
        include: [{
          model: Funcionario,
          attributes: ['id', 'nome', 'departamento']
        }],
        order: [['dataHora', 'ASC']]
      });

      // Agrupar por funcionário
      const agrupado = {};
      registros.forEach(reg => {
        const funcId = reg.funcionarioId;
        if (!agrupado[funcId]) {
          agrupado[funcId] = {
            funcionario: reg.Funcionario,
            registros: []
          };
        }
        agrupado[funcId].registros.push(reg);
      });

      res.json({
        sucesso: true,
        total: registros.length,
        dados: Object.values(agrupado)
      });

    } catch (error) {
      console.error('Erro ao buscar registros:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao buscar registros'
      });
    }
  }

  // ========== ENVIAR COMPROVANTE POR EMAIL ==========
  async enviarComprovanteEmail(req, res) {
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

      // Gerar PDF do comprovante
      const pdfBuffer = await RelatorioService.gerarComprovante(registro);

      // Enviar por email
      await EmailService.enviarComprovante(
        registro.Funcionario.email,
        registro.Funcionario.nome,
        registro,
        pdfBuffer
      );

      res.json({
        sucesso: true,
        mensagem: 'Comprovante enviado por email'
      });

    } catch (error) {
      console.error('Erro ao enviar comprovante:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao enviar comprovante'
      });
    }
  }
}

module.exports = new PontoController();