// C:\Projetos\ponto-certo-backend\src\config\email.js
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

class EmailConfig {
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
  }

  // Carregar template
  loadTemplate(templateName, data) {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    const template = fs.readFileSync(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(template);
    return compiledTemplate(data);
  }

  // Enviar email
  async sendEmail(to, subject, templateName, data) {
    try {
      const html = this.loadTemplate(templateName, data);
      
      const mailOptions = {
        from: `"Ponto-Certo" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email enviado:', info.messageId);
      return info;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  }

  // Templates prontos
  async sendWelcomeEmail(to, nome, empresa) {
    return this.sendEmail(to, 'Bem-vindo ao Ponto-Certo!', 'welcome', {
      nome,
      empresa,
      loginUrl: process.env.FRONTEND_URL
    });
  }

  async sendPasswordReset(to, token) {
    return this.sendEmail(to, 'Recuperação de Senha', 'reset-password', {
      resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${token}`
    });
  }

  async sendTimeRecord(to, nome, data, tipo) {
    return this.sendEmail(to, 'Comprovante de Ponto', 'time-record', {
      nome,
      data,
      tipo
    });
  }
}

module.exports = new EmailConfig();