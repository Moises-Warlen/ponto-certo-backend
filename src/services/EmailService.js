// C:\Projetos\ponto-certo-backend\src\services\EmailService.js
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Registrar helpers do Handlebars
    handlebars.registerHelper('formatDate', (date) => {
      return new Date(date).toLocaleDateString('pt-BR');
    });

    handlebars.registerHelper('formatTime', (date) => {
      return new Date(date).toLocaleTimeString('pt-BR');
    });

    handlebars.registerHelper('formatCurrency', (value) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    });
  }

  // Carregar template
  loadTemplate(templateName, data) {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template ${templateName} não encontrado`);
    }

    const template = fs.readFileSync(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(template);
    return compiledTemplate(data);
  }

  // Enviar email
  async sendEmail(to, subject, html, attachments = []) {
    try {
      const mailOptions = {
        from: `"Ponto-Certo" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email enviado para ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  }

  // Template de boas-vindas
  async sendWelcomeEmail(to, nome, empresa, senhaTemporaria) {
    const html = this.loadTemplate('welcome', {
      nome,
      empresa,
      senhaTemporaria,
      loginUrl: process.env.FRONTEND_URL
    });

    return this.sendEmail(
      to,
      'Bem-vindo ao Ponto-Certo!',
      html
    );
  }

  // Template de recuperação de senha
  async sendPasswordReset(to, nome, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const html = this.loadTemplate('reset-password', {
      nome,
      resetUrl
    });

    return this.sendEmail(
      to,
      'Recuperação de Senha - Ponto-Certo',
      html
    );
  }

  // Template de comprovante de ponto
  async sendTimeRecord(to, nome, registro, pdfBuffer) {
    const html = this.loadTemplate('time-record', {
      nome,
      data: registro.dataHora,
      tipo: registro.tipo,
      empresa: 'Sua Empresa'
    });

    return this.sendEmail(
      to,
      'Comprovante de Ponto',
      html,
      [{
        filename: `comprovante-${Date.now()}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    );
  }

  // Template de relatório mensal
  async sendMonthlyReport(to, nome, mes, ano, pdfBuffer) {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const html = this.loadTemplate('monthly-report', {
      nome,
      mes: meses[mes - 1],
      ano
    });

    return this.sendEmail(
      to,
      `Relatório Mensal - ${meses[mes - 1]}/${ano}`,
      html,
      [{
        filename: `relatorio-${mes}-${ano}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    );
  }

  // Template de notificação de ponto registrado
  async sendTimeNotification(to, nome, tipo, dataHora) {
    const tipos = {
      ENTRADA: 'Entrada',
      SAIDA: 'Saída',
      INTERVALO: 'Início do Intervalo',
      RETORNO: 'Fim do Intervalo'
    };

    const html = this.loadTemplate('time-notification', {
      nome,
      tipo: tipos[tipo] || tipo,
      data: dataHora
    });

    return this.sendEmail(
      to,
      `Ponto Registrado - ${tipos[tipo] || tipo}`,
      html
    );
  }

  // Template de alerta de inadimplência
  async sendPaymentAlert(to, nome, empresa, diasAtraso) {
    const html = this.loadTemplate('payment-alert', {
      nome,
      empresa,
      diasAtraso,
      diasAtrasoText: diasAtraso === 1 ? 'dia' : 'dias',
      loginUrl: process.env.FRONTEND_URL
    });

    return this.sendEmail(
      to,
      '⚠️ Alerta de Pagamento - Ponto-Certo',
      html
    );
  }
}

module.exports = new EmailService();