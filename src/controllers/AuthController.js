// C:\Projetos\ponto-certo-backend\src\controllers\AuthController.js
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { Usuario, Empresa } = require('../models');
const EmailService = require('../services/EmailService');

class AuthController {
  // ========== LOGIN ==========
  async login(req, res) {
    try {
      const { email, senha, codigo2FA } = req.body;

      // Validar campos
      if (!email || !senha) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Email e senha são obrigatórios'
        });
      }

      // Buscar usuário
      const usuario = await Usuario.findOne({
        where: { email },
        include: ['Empresa']
      });

      if (!usuario) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Email ou senha inválidos'
        });
      }

      // Verificar se está bloqueado
      if (usuario.estaBloqueado()) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Usuário bloqueado temporariamente',
          desbloqueio: usuario.bloqueadoAte
        });
      }

      // Verificar senha
      if (!usuario.verificarSenha(senha)) {
        usuario.registrarTentativa(false);
        await usuario.save();

        return res.status(401).json({
          sucesso: false,
          erro: 'Email ou senha inválidos'
        });
      }

      // Verificar 2FA
      if (usuario.doisFatoresAtivo) {
        if (!codigo2FA) {
          return res.status(401).json({
            sucesso: false,
            erro: 'Código 2FA necessário',
            precisa2FA: true
          });
        }

        const verificado = speakeasy.totp.verify({
          secret: usuario.segredo2FA,
          encoding: 'base32',
          token: codigo2FA,
          window: 1
        });

        if (!verificado) {
          return res.status(401).json({
            sucesso: false,
            erro: 'Código 2FA inválido'
          });
        }
      }

      // Verificar empresa
      if (usuario.tipo !== 'MASTER') {
        const empresa = usuario.Empresa;

        if (!empresa) {
          return res.status(401).json({
            sucesso: false,
            erro: 'Empresa não encontrada'
          });
        }

        // Verificar status
        if (empresa.status === 'CANCELADA') {
          return res.status(401).json({
            sucesso: false,
            erro: 'Empresa cancelada'
          });
        }

        if (empresa.status === 'SUSPENSA') {
          return res.status(401).json({
            sucesso: false,
            erro: 'Acesso suspenso'
          });
        }

        // Verificar período de teste
        if (empresa.status === 'TESTE') {
          const hoje = new Date();
          if (hoje > empresa.dataExpiracaoTeste) {
            empresa.status = 'INADIMPLENTE';
            await empresa.save();

            return res.status(401).json({
              sucesso: false,
              erro: 'Período de teste expirado'
            });
          }
        }
      }

      // Registrar login bem-sucedido
      usuario.registrarTentativa(true);
      usuario.ultimoAcesso = new Date();
      usuario.ultimoIP = req.ip;
      await usuario.save();

      // Gerar token
      const token = jwt.sign(
        {
          id: usuario.id,
          email: usuario.email,
          tipo: usuario.tipo,
          empresaId: usuario.empresaId
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Remover dados sensíveis
      const usuarioJSON = usuario.toJSON();
      delete usuarioJSON.senha;
      delete usuarioJSON.segredo2FA;

      res.json({
        sucesso: true,
        token,
        usuario: usuarioJSON,
        empresa: usuario.Empresa ? {
          id: usuario.Empresa.id,
          nome: usuario.Empresa.nomeFantasia,
          status: usuario.Empresa.status,
          tema: usuario.Empresa.getTema()
        } : null
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro interno no servidor'
      });
    }
  }

  // ========== ATIVAR 2FA ==========
  async ativar2FA(req, res) {
    try {
      const { usuario } = req;

      // Gerar segredo
      const secret = speakeasy.generateSecret({
        name: `Ponto-Certo:${usuario.email}`
      });

      // Gerar QR Code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      // Gerar códigos de recuperação
      const codigosRecuperacao = [];
      for (let i = 0; i < 8; i++) {
        codigosRecuperacao.push(
          Math.random().toString(36).substring(2, 10).toUpperCase()
        );
      }

      res.json({
        sucesso: true,
        secret: secret.base32,
        qrCode,
        codigosRecuperacao
      });

    } catch (error) {
      console.error('Erro ao ativar 2FA:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao ativar 2FA'
      });
    }
  }

  // ========== VERIFICAR E ATIVAR 2FA ==========
  async verificarEAtivar2FA(req, res) {
    try {
      const { usuario } = req;
      const { segredo, codigo, codigosRecuperacao } = req.body;

      // Verificar código
      const verificado = speakeasy.totp.verify({
        secret: segredo,
        encoding: 'base32',
        token: codigo,
        window: 1
      });

      if (!verificado) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Código inválido'
        });
      }

      // Ativar 2FA
      usuario.ativar2FA(segredo);
      usuario.codigosRecuperacao2FA = codigosRecuperacao;
      await usuario.save();

      res.json({
        sucesso: true,
        mensagem: '2FA ativado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao verificar 2FA:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao verificar 2FA'
      });
    }
  }

  // ========== RECUPERAR SENHA ==========
  async recuperarSenha(req, res) {
    try {
      const { email } = req.body;

      const usuario = await Usuario.findOne({ where: { email } });

      if (!usuario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Usuário não encontrado'
        });
      }

      // Gerar token de recuperação
      const token = jwt.sign(
        { id: usuario.id },
        process.env.JWT_SECRET + usuario.senha,
        { expiresIn: '1h' }
      );

      // Enviar email
      await EmailService.sendPasswordReset(email, token);

      res.json({
        sucesso: true,
        mensagem: 'Email de recuperação enviado'
      });

    } catch (error) {
      console.error('Erro ao recuperar senha:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao recuperar senha'
      });
    }
  }

  // ========== REDEFINIR SENHA ==========
  async redefinirSenha(req, res) {
    try {
      const { token, novaSenha } = req.body;

      // Decodificar token (sem verificar assinatura ainda)
      const decoded = jwt.decode(token);

      if (!decoded || !decoded.id) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Token inválido'
        });
      }

      // Buscar usuário
      const usuario = await Usuario.findByPk(decoded.id);

      if (!usuario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Usuário não encontrado'
        });
      }

      // Verificar token com a senha atual
      try {
        jwt.verify(token, process.env.JWT_SECRET + usuario.senha);
      } catch (error) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Token expirado ou inválido'
        });
      }

      // Alterar senha
      usuario.senha = novaSenha;
      await usuario.save();

      res.json({
        sucesso: true,
        mensagem: 'Senha redefinida com sucesso'
      });

    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao redefinir senha'
      });
    }
  }
}

module.exports = new AuthController();