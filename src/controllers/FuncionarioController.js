// C:\Projetos\ponto-certo-backend\src\controllers\FuncionarioController.js
const { Funcionario, Usuario } = require('../models');
const { Op } = require('sequelize');
const { cpf } = require('cpf-cnpj-validator');
const upload = require('../config/upload');
const EmailService = require('../services/EmailService');

class FuncionarioController {
  // ========== LISTAR FUNCIONÁRIOS ==========
  async listar(req, res) {
    try {
      const { empresaId } = req.usuario;
      const { departamento, status, search, page = 1, limit = 10 } = req.query;

      const where = { empresaId };

      if (departamento) where.departamento = departamento;
      if (status) where.status = status;
      if (search) {
        where[Op.or] = [
          { nome: { [Op.iLike]: `%${search}%` } },
          { cpf: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { matricula: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const funcionarios = await Funcionario.findAndCountAll({
        where,
        limit,
        offset,
        order: [['nome', 'ASC']]
      });

      res.json({
        sucesso: true,
        total: funcionarios.count,
        pagina: page,
        totalPaginas: Math.ceil(funcionarios.count / limit),
        dados: funcionarios.rows
      });

    } catch (error) {
      console.error('Erro ao listar funcionários:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao listar funcionários'
      });
    }
  }

  // ========== BUSCAR FUNCIONÁRIO POR ID ==========
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const { empresaId } = req.usuario;

      const funcionario = await Funcionario.findOne({
        where: { id, empresaId }
      });

      if (!funcionario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Funcionário não encontrado'
        });
      }

      res.json({
        sucesso: true,
        dados: funcionario
      });

    } catch (error) {
      console.error('Erro ao buscar funcionário:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao buscar funcionário'
      });
    }
  }

  // ========== CRIAR FUNCIONÁRIO ==========
  async criar(req, res) {
    try {
      const { empresaId } = req.usuario;
      const dados = req.body;

      // Validar CPF
      if (!cpf.isValid(dados.cpf)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'CPF inválido'
        });
      }

      // Verificar se já existe
      const existe = await Funcionario.findOne({
        where: {
          [Op.or]: [
            { cpf: dados.cpf },
            { email: dados.email }
          ]
        }
      });

      if (existe) {
        return res.status(400).json({
          sucesso: false,
          erro: 'CPF ou email já cadastrado'
        });
      }

      // Adicionar empresaId
      dados.empresaId = empresaId;

      // Criar funcionário
      const funcionario = await Funcionario.create(dados);

      // Criar usuário para acesso
      await Usuario.create({
        empresaId,
        funcionarioId: funcionario.id,
        nome: funcionario.nome,
        email: funcionario.email,
        senha: funcionario.cpf, // Senha inicial = CPF
        tipo: 'FUNCIONARIO'
      });

      // Enviar email de boas-vindas
      try {
        await EmailService.sendWelcomeEmail(
          funcionario.email,
          funcionario.nome,
          'Empresa'
        );
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
      }

      res.status(201).json({
        sucesso: true,
        mensagem: 'Funcionário cadastrado com sucesso',
        dados: funcionario
      });

    } catch (error) {
      console.error('Erro ao criar funcionário:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao criar funcionário'
      });
    }
  }

  // ========== EDITAR FUNCIONÁRIO ==========
  async editar(req, res) {
    try {
      const { id } = req.params;
      const { empresaId } = req.usuario;
      const dados = req.body;

      const funcionario = await Funcionario.findOne({
        where: { id, empresaId }
      });

      if (!funcionario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Funcionário não encontrado'
        });
      }

      // Campos que não podem ser alterados
      delete dados.id;
      delete dados.cpf;
      delete dados.matricula;

      await funcionario.update(dados);

      // Atualizar usuário se email mudou
      if (dados.email) {
        await Usuario.update(
          { email: dados.email },
          { where: { funcionarioId: id } }
        );
      }

      res.json({
        sucesso: true,
        mensagem: 'Funcionário atualizado com sucesso',
        dados: funcionario
      });

    } catch (error) {
      console.error('Erro ao editar funcionário:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao editar funcionário'
      });
    }
  }

  // ========== ALTERAR STATUS ==========
  async alterarStatus(req, res) {
    try {
      const { id } = req.params;
      const { empresaId } = req.usuario;
      const { status, motivo } = req.body;

      const funcionario = await Funcionario.findOne({
        where: { id, empresaId }
      });

      if (!funcionario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Funcionário não encontrado'
        });
      }

      funcionario.status = status;
      await funcionario.save();

      // Atualizar status do usuário
      await Usuario.update(
        { ativo: status === 'ATIVO' },
        { where: { funcionarioId: id } }
      );

      res.json({
        sucesso: true,
        mensagem: `Status alterado para ${status}`,
        dados: funcionario
      });

    } catch (error) {
      console.error('Erro ao alterar status:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao alterar status'
      });
    }
  }

  // ========== EXCLUIR FUNCIONÁRIO ==========
  async excluir(req, res) {
    try {
      const { id } = req.params;
      const { empresaId } = req.usuario;

      const funcionario = await Funcionario.findOne({
        where: { id, empresaId }
      });

      if (!funcionario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Funcionário não encontrado'
        });
      }

      // Exclusão lógica
      funcionario.status = 'DEMITIDO';
      await funcionario.save();

      // Desativar usuário
      await Usuario.update(
        { ativo: false },
        { where: { funcionarioId: id } }
      );

      res.json({
        sucesso: true,
        mensagem: 'Funcionário desativado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao excluir funcionário'
      });
    }
  }

  // ========== UPLOAD FOTO ==========
  async uploadFoto(req, res) {
    try {
      const { id } = req.params;
      const { empresaId } = req.usuario;

      if (!req.file) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Nenhuma imagem enviada'
        });
      }

      const funcionario = await Funcionario.findOne({
        where: { id, empresaId }
      });

      if (!funcionario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Funcionário não encontrado'
        });
      }

      funcionario.foto = req.file.path;
      await funcionario.save();

      res.json({
        sucesso: true,
        mensagem: 'Foto atualizada com sucesso',
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

  // ========== GERAR NOVO PIN ==========
  async gerarNovoPin(req, res) {
    try {
      const { id } = req.params;
      const { empresaId } = req.usuario;

      const funcionario = await Funcionario.findOne({
        where: { id, empresaId }
      });

      if (!funcionario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Funcionário não encontrado'
        });
      }

      const novoPin = funcionario.gerarNovoPin();
      await funcionario.save();

      res.json({
        sucesso: true,
        mensagem: 'Novo PIN gerado com sucesso',
        pin: novoPin
      });

    } catch (error) {
      console.error('Erro ao gerar PIN:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao gerar PIN'
      });
    }
  }
}

module.exports = new FuncionarioController();