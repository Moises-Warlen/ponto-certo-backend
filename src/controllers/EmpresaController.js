// C:\Projetos\ponto-certo-backend\src\controllers\EmpresaController.js
const { Empresa, Usuario, Pagamento, Funcionario } = require('../models');
const { Op } = require('sequelize');
const { cnpj } = require('cpf-cnpj-validator');
const upload = require('../config/upload');

class EmpresaController {
  // ========== LISTAR EMPRESAS ==========
  async listar(req, res) {
    try {
      const { status, plano, search } = req.query;

      const where = {};

      if (status) where.status = status;
      if (plano) where.plano = plano;
      if (search) {
        where[Op.or] = [
          { razaoSocial: { [Op.iLike]: `%${search}%` } },
          { nomeFantasia: { [Op.iLike]: `%${search}%` } },
          { cnpj: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const empresas = await Empresa.findAndCountAll({
        where,
        include: [
          {
            model: Funcionario,
            attributes: ['id'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Adicionar contagem de funcionários
      const empresasComContagem = empresas.rows.map(emp => {
        const empJSON = emp.toJSON();
        empJSON.totalFuncionarios = emp.Funcionarios?.length || 0;
        delete empJSON.Funcionarios;
        return empJSON;
      });

      res.json({
        sucesso: true,
        total: empresas.count,
        dados: empresasComContagem
      });

    } catch (error) {
      console.error('Erro ao listar empresas:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao listar empresas'
      });
    }
  }

  // ========== BUSCAR EMPRESA POR ID ==========
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const empresa = await Empresa.findByPk(id, {
        include: [
          {
            model: Funcionario,
            attributes: ['id', 'nome', 'cpf', 'status']
          },
          {
            model: Pagamento,
            limit: 12,
            order: [['createdAt', 'DESC']]
          }
        ]
      });

      if (!empresa) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Empresa não encontrada'
        });
      }

      res.json({
        sucesso: true,
        dados: empresa
      });

    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao buscar empresa'
      });
    }
  }

  // ========== CRIAR EMPRESA ==========
  async criar(req, res) {
    try {
      const dados = req.body;

      // Validar CNPJ
      if (!cnpj.isValid(dados.cnpj)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'CNPJ inválido'
        });
      }

      // Verificar se já existe
      const existe = await Empresa.findOne({
        where: {
          [Op.or]: [
            { cnpj: dados.cnpj },
            { email: dados.email }
          ]
        }
      });

      if (existe) {
        return res.status(400).json({
          sucesso: false,
          erro: 'CNPJ ou email já cadastrado'
        });
      }

      // Criar empresa
      const empresa = await Empresa.create(dados);

      res.status(201).json({
        sucesso: true,
        mensagem: 'Empresa criada com sucesso',
        dados: empresa
      });

    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao criar empresa'
      });
    }
  }

  // ========== ATUALIZAR EMPRESA ==========
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;

      const empresa = await Empresa.findByPk(id);

      if (!empresa) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Empresa não encontrada'
        });
      }

      await empresa.update(dados);

      res.json({
        sucesso: true,
        mensagem: 'Empresa atualizada com sucesso',
        dados: empresa
      });

    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao atualizar empresa'
      });
    }
  }

  // ========== ALTERAR STATUS ==========
  async alterarStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, motivo } = req.body;

      const empresa = await Empresa.findByPk(id);

      if (!empresa) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Empresa não encontrada'
        });
      }

      // Se for cancelar, registrar motivo
      if (status === 'CANCELADA') {
        empresa.dataCancelamento = new Date();
        empresa.motivoCancelamento = motivo;
      }

      empresa.status = status;
      await empresa.save();

      // Se for ativar, reativar todos os usuários?
      if (status === 'ATIVA') {
        await Usuario.update(
          { ativo: true },
          { where: { empresaId: id } }
        );
      }

      // Se for suspender/cancelar, desativar usuários
      if (['SUSPENSA', 'CANCELADA'].includes(status)) {
        await Usuario.update(
          { ativo: false },
          { where: { empresaId: id } }
        );
      }

      res.json({
        sucesso: true,
        mensagem: `Status alterado para ${status}`,
        dados: empresa
      });

    } catch (error) {
      console.error('Erro ao alterar status:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao alterar status'
      });
    }
  }

  // ========== EXCLUIR EMPRESA (LÓGICO) ==========
  async excluir(req, res) {
    try {
      const { id } = req.params;

      const empresa = await Empresa.findByPk(id);

      if (!empresa) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Empresa não encontrada'
        });
      }

      // Exclusão lógica
      empresa.status = 'CANCELADA';
      empresa.dataCancelamento = new Date();
      await empresa.save();

      // Desativar todos os usuários
      await Usuario.update(
        { ativo: false },
        { where: { empresaId: id } }
      );

      res.json({
        sucesso: true,
        mensagem: 'Empresa cancelada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao excluir empresa'
      });
    }
  }

  // ========== RELATÓRIO FINANCEIRO ==========
  async relatorioFinanceiro(req, res) {
    try {
      const { id } = req.params;
      const { ano } = req.query;

      const anoAtual = ano || new Date().getFullYear();

      const empresa = await Empresa.findByPk(id);

      if (!empresa) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Empresa não encontrada'
        });
      }

      // Buscar pagamentos do ano
      const pagamentos = await Pagamento.findAll({
        where: {
          empresaId: id,
          ano: anoAtual
        },
        order: [['mes', 'ASC']]
      });

      // Calcular resumo
      const meses = Array.from({ length: 12 }, (_, i) => i + 1);
      const dadosMensais = meses.map(mes => {
        const pagamento = pagamentos.find(p => p.mes === mes);
        return {
          mes,
          pago: pagamento?.status === 'PAGO',
          valor: pagamento?.valor || 0,
          dataPagamento: pagamento?.dataPagamento,
          status: pagamento?.status || 'PENDENTE'
        };
      });

      const totalPago = pagamentos
        .filter(p => p.status === 'PAGO')
        .reduce((acc, p) => acc + parseFloat(p.valor), 0);

      const inadimplencia = pagamentos.filter(p => p.estaAtrasado()).length;

      res.json({
        sucesso: true,
        dados: {
          empresa: {
            id: empresa.id,
            nome: empresa.nomeFantasia,
            plano: empresa.plano,
            valorMensal: empresa.valorMensal
          },
          ano: anoAtual,
          resumo: {
            totalPago,
            mesesPagos: pagamentos.filter(p => p.status === 'PAGO').length,
            inadimplencia,
            inadimplenciaPercentual: (inadimplencia / 12) * 100
          },
          mensal: dadosMensais
        }
      });

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao gerar relatório'
      });
    }
  }

  // ========== REGISTRAR PAGAMENTO ==========
  async registrarPagamento(req, res) {
    try {
      const { id } = req.params;
      const { mes, ano, valor, formaPagamento } = req.body;

      const empresa = await Empresa.findByPk(id);

      if (!empresa) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Empresa não encontrada'
        });
      }

      // Verificar se já existe pagamento para este mês
      const existe = await Pagamento.findOne({
        where: {
          empresaId: id,
          mes,
          ano
        }
      });

      if (existe) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Pagamento já registrado para este mês'
        });
      }

      // Criar pagamento
      const pagamento = await Pagamento.create({
        empresaId: id,
        mes,
        ano,
        valor: valor || empresa.valorMensal,
        dataVencimento: new Date(ano, mes - 1, empresa.diaVencimento),
        dataPagamento: new Date(),
        formaPagamento,
        status: 'PAGO'
      });

      // Se estava inadimplente, ativar
      if (empresa.status === 'INADIMPLENTE') {
        empresa.status = 'ATIVA';
        await empresa.save();
      }

      res.status(201).json({
        sucesso: true,
        mensagem: 'Pagamento registrado com sucesso',
        dados: pagamento
      });

    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao registrar pagamento'
      });
    }
  }

  // ========== UPLOAD LOGO ==========
  async uploadLogo(req, res) {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Nenhuma imagem enviada'
        });
      }

      const empresa = await Empresa.findByPk(id);

      if (!empresa) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Empresa não encontrada'
        });
      }

      empresa.logo = req.file.path;
      await empresa.save();

      res.json({
        sucesso: true,
        mensagem: 'Logo atualizada com sucesso',
        caminho: req.file.path
      });

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao fazer upload'
      });
    }
  }
}

module.exports = new EmpresaController();