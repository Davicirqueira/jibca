const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Inicializar configuração do email
   */
  async initialize() {
    try {
      // Configurar transporter com SMTP
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras portas
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Verificar conexão
      await this.transporter.verify();
      this.initialized = true;
      console.log('✅ Serviço de email inicializado com sucesso');
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar serviço de email:', error.message);
      console.warn('⚠️  Sistema continuará sem envio de emails');
      this.initialized = false;
      return false;
    }
  }

  /**
   * Verificar se o serviço está configurado
   */
  isConfigured() {
    return this.initialized && this.transporter !== null;
  }

  /**
   * Enviar email de recuperação de senha
   */
  async sendPasswordResetEmail(email, token, userName) {
    try {
      // Se não estiver configurado, apenas logar
      if (!this.isConfigured()) {
        console.log('📧 Email não enviado (serviço não configurado)');
        console.log(`   Para: ${email}`);
        console.log(`   Token: ${token}`);
        console.log(`   URL: ${process.env.FRONTEND_URL}/reset-password?token=${token}`);
        return { success: false, reason: 'not_configured' };
      }

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Agenda JIBCA'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Recuperação de Senha - Agenda JIBCA',
        html: this.getPasswordResetTemplate(userName, resetUrl)
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email de recuperação enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
      
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Template HTML para email de recuperação de senha
   */
  getPasswordResetTemplate(userName, resetUrl) {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperação de Senha</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #8B0000 0%, #6B0000 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Agenda JIBCA</h1>
                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Recuperação de Senha</p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Olá <strong>${userName || 'usuário'}</strong>,
                    </p>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Recebemos uma solicitação para redefinir a senha da sua conta na Agenda JIBCA.
                    </p>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      Clique no botão abaixo para criar uma nova senha:
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${resetUrl}" 
                             style="background-color: #8B0000; 
                                    color: #ffffff; 
                                    text-decoration: none; 
                                    padding: 15px 40px; 
                                    border-radius: 8px; 
                                    font-size: 16px; 
                                    font-weight: bold; 
                                    display: inline-block;">
                            Redefinir Senha
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #eeeeee;">
                      <strong>⏰ Este link expira em 60 minutos.</strong>
                    </p>
                    
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 10px 0 0 0;">
                      Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá inalterada.
                    </p>
                    
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                      Se o botão não funcionar, copie e cole este link no seu navegador:
                    </p>
                    
                    <p style="color: #8B0000; font-size: 12px; line-height: 1.6; margin: 10px 0 0 0; word-break: break-all;">
                      ${resetUrl}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 0;">
                      Este é um email automático, por favor não responda.
                    </p>
                    <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 10px 0 0 0;">
                      © ${new Date().getFullYear()} Juventude JIBCA - Todos os direitos reservados
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Enviar email de teste
   */
  async sendTestEmail(email) {
    try {
      if (!this.isConfigured()) {
        return { success: false, reason: 'not_configured' };
      }

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Agenda JIBCA'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Teste de Email - Agenda JIBCA',
        html: `
          <h1>Email de Teste</h1>
          <p>Se você recebeu este email, o serviço de email está funcionando corretamente!</p>
          <p>Data/Hora: ${new Date().toLocaleString('pt-BR')}</p>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de teste enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
      
    } catch (error) {
      console.error('❌ Erro ao enviar email de teste:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Exportar instância única (singleton)
module.exports = new EmailService();
