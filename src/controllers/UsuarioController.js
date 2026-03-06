// C:\Projetos\ponto-certo-backend\src\controllers\UsuarioController.js
const { Usuario, Funcionario } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

class UsuarioController {
  // ========== LISTAR USUÁRIOS ==========
  async listar(req, res) {
    try {
      const { empresaId, tipo } = req.usuario;
      const { search, ativo, page = 1, limit = 10 } = req.query;

      const where = {};

      // MASTER vê todos, outros vêem apenas da sua empresa
      if (tipo !== 'MASTER') {
        where.empresaId = empresaId;
      }

      if (search) {
        where[Op.or] = [
          { nome: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (ativo !== undefined) {
        where.ativo = ativo === 'true';
      }

      const offset = (page - 1) * limit;

      const usuarios = await Usuario.findAndCountAll({
        where,
        attributes: { exclude: ['senha', 'segredo2FA'] },
        include: [{
          model: Funcionario,
          attributes: ['id', 'nome', 'matricula']
        }],
        limit,
        offset,
        order: [['nome', 'ASC']]
      });

      res.json({
        sucesso: true,
        total: usuarios.count,
        pagina: page,
        totalPaginas: Math.ceil(usuarios.count / limit),
        dados: usuarios.rows
      });

    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao listar usuários'
      });
    }
  }

  // ========== MEU PERFIL ==========
  async meuPerfil(req, res) {
    try {
      const { usuario } = req;

      const usuarioCompleto = await Usuario.findByPk(usuario.id, {
        attributes: { exclude: ['senha', 'segredo2FA'] },
        include: [
          {
            model: Funcionario,
            attributes: ['id', 'nome', 'matricula', 'departamento', 'cargo', 'foto']
          },
          {
            model: Empresa,
            attributes: ['id', 'nomeFantasia', 'logo', 'corPrimaria']
          }
        ]
      });

      res.json({
        sucesso: true,
        dados: usuarioCompleto
      });

    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao buscar perfil'
      });
    }
  }

  // ========== ATUALIZAR PERFIL ==========
  async atualizarPerfil(req, res) {
    try {
      const { id } = req.usuario;
      const { nome, telefone, notificacoes } = req.body;

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Usuário não encontrado'
        });
      }

      await usuario.update({
        nome: nome || usuario.nome,
        telefone: telefone || usuario.telefone,
        notificacoes: notificacoes || usuario.notificacoes
      });

      const usuarioAtualizado = await Usuario.findByPk(id, {
        attributes: { exclude: ['senha', 'segredo2FA'] }
      });

      res.json({
        sucesso: true,
        mensagem: 'Perfil atualizado com sucesso',
        dados: usuarioAtualizado
      });

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao atualizar perfil'
      });
    }
  }

  // ========== ALTERAR SENHA ==========
  async alterarSenha(req, res) {
    try {
      const { id } = req.usuario;
      const { senhaAtual, novaSenha } = req.body;

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Usuário não encontrado'
        });
      }

      if (!usuario.verificarSenha(senhaAtual)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Senha atual incorreta'
        });
      }

      usuario.senha = novaSenha;
      await usuario.save();

      res.json({
        sucesso: true,
        mensagem: 'Senha alterada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao alterar senha'
      });
    }
  }

  // ========== CRIAR USUÁRIO ==========
  async criar(req, res) {
    try {
      const { empresaId } = req.usuario;
      const dados = req.body;

      // Verificar se email já existe
      const existe = await Usuario.findOne({
        where: { email: dados.email }
      });

      if (existe) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Email já cadastrado'
        });
      }

      // Criar usuário
      const usuario = await Usuario.create({
        ...dados,
        empresaId: dados.empresaId || empresaId
      });

      const usuarioCriado = await Usuario.findByPk(usuario.id, {
        attributes: { exclude: ['senha', 'segredo2FA'] }
      });

      res.status(201).json({
        sucesso: true,
        mensagem: 'Usuário criado com sucesso',
        dados: usuarioCriado
      });

    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao criar usuário'
      });
    }
  }

  // ========== EDITAR USUÁRIO ==========
  async editar(req, res) {
    try {
      const { id } = req.params;
      const { nome, telefone, tipo, ativo, permissoes } = req.body;

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Usuário não encontrado'
        });
      }

      await usuario.update({
        nome: nome || usuario.nome,
        telefone: telefone || usuario.telefone,
        tipo: tipo || usuario.tipo,
        ativo: ativo !== undefined ? ativo : usuario.ativo,
        permissoes: permissoes || usuario.permissoes
      });

      const usuarioAtualizado = await Usuario.findByPk(id, {
        attributes: { exclude: ['senha', 'segredo2FA'] }
      });

      res.json({
        sucesso: true,
        mensagem: 'Usuário atualizado com sucesso',
        dados: usuarioAtualizado
      });

    } catch (error) {
      console.error('Erro ao editar usuário:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao editar usuário'
      });
    }
  }

  // ========== ALTERAR PERMISSÕES ==========
  async alterarPermissoes(req, res) {
    try {
      const { id } = req.params;
      const { permissoes } = req.body;

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Usuário não encontrado'
        });
      }

      if (usuario.tipo === 'MASTER') {
        return res.status(400).json({
          sucesso: false,
          erro: 'Não é possível alterar permissões do usuário MASTER'
        });
      }

      usuario.permissoes = permissoes;
      await usuario.save();

      res.json({
        sucesso: true,
        mensagem: 'Permissões atualizadas com sucesso'
      });

    } catch (error) {
      console.error('Erro ao alterar permissões:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao alterar permissões'
      });
    }
  }

  // ========== EXCLUIR USUÁRIO ==========
  async excluir(req, res) {
    try {
      const { id } = req.params;

      if (id === req.usuario.id) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Não é possível excluir seu próprio usuário'
        });
      }

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Usuário não encontrado'
        });
      }

      if (usuario.tipo === 'MASTER') {
        return res.status(400).json({
          sucesso: false,
          erro: 'Não é possível excluir o usuário MASTER'
        });
      }

      await usuario.destroy();

      res.json({
        sucesso: true,
        mensagem: 'Usuário excluído com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao excluir usuário'
      });
    }
  }

  // ========== DASHBOARD ADMIN ==========
  async dashboardAdmin(req, res) {
    try {
      const { empresaId, tipo } = req.usuario;

      const where = tipo === 'MASTER' ? {} : { empresaId };

      const totalUsuarios = await Usuario.count({ where });
      const usuariosAtivos = await Usuario.count({ where: { ...where, ativo: true } });
      const usuariosInativos = await Usuario.count({ where: { ...where, ativo: false } });

      const usuariosPorTipo = await Usuario.findAll({
        where,
        attributes: ['tipo', [sequelize.fn('COUNT', sequelize.col('tipo')), 'total']],
        group: ['tipo']
      });

      res.json({
        sucesso: true,
        dados: {
          totalUsuarios,
          usuariosAtivos,
          usuariosInativos,
          usuariosPorTipo
        }
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao carregar dashboard'
      });
    }
  }
}

module.exports = new UsuarioController();