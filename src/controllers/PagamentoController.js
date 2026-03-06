// C:\Projetos\ponto-certo-backend\src\controllers\PagamentoController.js
const { Pagamento, Empresa } = require('../models');
const { Op } = require('sequelize');
const PagamentoService = require('../services/PagamentoService');

class PagamentoController {
  // ========== LISTAR PAGAMENTOS ==========
  async listar(req, res) {
    try {
      const { empresaId } = req.params;
      const { ano, mes, status, page = 1, limit = 12 } = req.query;

      const where = { empresaId };

      if (ano) where.ano = ano;
      if (mes) where.mes = mes;
      if (status) where.status = status;

      const offset = (page - 1) * limit;

      const pagamentos = await Pagamento.findAndCountAll({
        where,
        limit,
        offset,
        order: [['ano', 'DESC'], ['mes', 'DESC']]
      });

      res.json({
        sucesso: true,
        total: pagamentos.count,
        pagina: page,
        dados: pagamentos.rows
      });

    } catch (error) {
      console.error('Erro ao listar pagamentos:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao listar pagamentos'
      });
    }
  }

  // ========== GERAR BOLETO ==========
  async gerarBoleto(req, res) {
    try {
      const { empresaId } = req.params;
      const { mes, ano } = req.query;

      const empresa = await Empresa.findByPk(empresaId);

      if (!empresa) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Empresa não encontrada'
        });
      }

      // Verificar se já existe pagamento para este mês
      let pagamento = await Pagamento.findOne({
        where: {
          empresaId,
          mes,
          ano
        }
      });

      // Se não existe, criar
      if (!pagamento) {
        pagamento = await Pagamento.create({
          empresaId,
          mes,
          ano,
          valor: empresa.valorMensal,
          dataVencimento: new Date(ano, mes - 1, empresa.diaVencimento),
          status: 'PENDENTE'
        });
      }

      // Gerar boleto
      const boleto = await PagamentoService.gerarBoleto(pagamento, empresa);

      res.json({
        sucesso: true,
        dados: {
          id: pagamento.id,
          linhaDigitavel: boleto.linhaDigitavel,
          codigoBarras: boleto.codigoBarras,
          url: boleto.url
        }
      });

    } catch (error) {
      console.error('Erro ao gerar boleto:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao gerar boleto'
      });
    }
  }

  // ========== GERAR PIX ==========
  async gerarPix(req, res) {
    try {
      const { empresaId } = req.params;
      const { mes, ano } = req.query;

      const empresa = await Empresa.findByPk(empresaId);

      if (!empresa) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Empresa não encontrada'
        });
      }

      // Verificar se já existe pagamento
      let pagamento = await Pagamento.findOne({
        where: {
          empresaId,
          mes,
          ano
        }
      });

      // Se não existe, criar
      if (!pagamento) {
        pagamento = await Pagamento.create({
          empresaId,
          mes,
          ano,
          valor: empresa.valorMensal,
          dataVencimento: new Date(ano, mes - 1, empresa.diaVencimento),
          status: 'PENDENTE'
        });
      }

      // Gerar PIX
      const pix = await PagamentoService.gerarPix(pagamento, empresa);

      pagamento.pixCopiaECola = pix.copiaECola;
      pagamento.qrCode = pix.qrCode;
      await pagamento.save();

      res.json({
        sucesso: true,
        dados: {
          id: pagamento.id,
          copiaECola: pix.copiaECola,
          qrCode: pix.qrCode,
          valor: pagamento.valor
        }
      });

    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao gerar PIX'
      });
    }
  }

  // ========== CONFIRMAR PAGAMENTO ==========
  async confirmarPagamento(req, res) {
    try {
      const { id } = req.params;
      const { transacaoId, comprovante } = req.body;

      const pagamento = await Pagamento.findByPk(id);

      if (!pagamento) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Pagamento não encontrado'
        });
      }

      pagamento.status = 'PAGO';
      pagamento.dataPagamento = new Date();
      pagamento.transacaoId = transacaoId;
      pagamento.comprovante = comprovante;
      await pagamento.save();

      // Atualizar status da empresa se estava inadimplente
      const empresa = await Empresa.findByPk(pagamento.empresaId);
      
      if (empresa && empresa.status === 'INADIMPLENTE') {
        const pagamentosAtrasados = await Pagamento.count({
          where: {
            empresaId: empresa.id,
            status: 'ATRASADO'
          }
        });

        if (pagamentosAtrasados === 0) {
          empresa.status = 'ATIVA';
          await empresa.save();
        }
      }

      res.json({
        sucesso: true,
        mensagem: 'Pagamento confirmado com sucesso',
        dados: pagamento
      });

    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao confirmar pagamento'
      });
    }
  }

  // ========== HISTÓRICO DE PAGAMENTOS ==========
  async historico(req, res) {
    try {
      const { empresaId } = req.params;
      const { anos = 2 } = req.query;

      const dataLimite = new Date();
      dataLimite.setFullYear(dataLimite.getFullYear() - anos);

      const pagamentos = await Pagamento.findAll({
        where: {
          empresaId,
          createdAt: {
            [Op.gte]: dataLimite
          }
        },
        order: [['ano', 'DESC'], ['mes', 'DESC']]
      });

      // Agrupar por ano
      const porAno = {};
      pagamentos.forEach(p => {
        if (!porAno[p.ano]) {
          porAno[p.ano] = [];
        }
        porAno[p.ano].push(p);
      });

      res.json({
        sucesso: true,
        dados: porAno
      });

    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao buscar histórico'
      });
    }
  }
}

module.exports = new PagamentoController();