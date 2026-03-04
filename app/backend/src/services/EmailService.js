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
      // Verificar se as configurações estão presentes
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('⚠️  Configurações de email não encontradas no .env');
        console.warn('⚠️  Sistema continuará sem envio de emails');
        this.initialized = false;
        return false;
      }

      // Configurar transporter com SMTP
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para outras portas
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      // Verificar conexão
      await this.transporter.verify();
      this.initialized = true;
      console.log('✅ Serviço de email inicializado com sucesso');
      console.log(`   Host: ${process.env.EMAIL_HOST}`);
      console.log(`   User: ${process.env.EMAIL_USER}`);
      console.log(`   From: ${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar serviço de email:', error.message);
      console.error('   Detalhes:', {
        code: error.code,
        command: error.command,
        response: error.response
      });
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
        from: `"${process.env.EMAIL_FROM_NAME || 'Agenda JIBCA'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Recuperação de Senha - Agenda JIBCA',
        html: this.getPasswordResetTemplate(userName, resetUrl)
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email de recuperação enviado com sucesso');
      console.log(`   Destinatário: ${email}`);
      console.log(`   Usuário: ${userName}`);
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   Timestamp: ${new Date().toISOString()}`);
      
      // Em desenvolvimento, mostrar URL
      if (process.env.NODE_ENV === 'development') {
        console.log(`   URL (DEV): ${resetUrl}`);
      }
      
      return { success: true, messageId: info.messageId };
      
    } catch (error) {
      console.error('❌ Erro ao enviar email de recuperação');
      console.error(`   Destinatário: ${email}`);
      console.error(`   Erro: ${error.message}`);
      console.error(`   Código: ${error.code}`);
      console.error(`   Comando: ${error.command}`);
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
        <title>Recuperação de Senha - JIBCA</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                
                <!-- Header com identidade JIBCA -->
                <tr>
                  <td style="background: linear-gradient(135deg, #3D1F1F 0%, #2A1515 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: #C0C0C0; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">
                      JIBCA
                    </h1>
                    <p style="color: #E0E0E0; margin: 10px 0 0 0; font-size: 14px; font-style: italic;">
                      1 Timóteo 4:12
                    </p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">
                      Recuperação de Senha
                    </h2>
                    
                    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Olá <strong>${userName || 'membro'}</strong>,
                    </p>
                    
                    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Recebemos uma solicitação para redefinir a senha da sua conta na Agenda JIBCA.
                    </p>
                    
                    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      Clique no botão abaixo para criar uma nova senha:
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${resetUrl}" 
                             style="display: inline-block;
                                    background-color: #8B0000; 
                                    color: #ffffff; 
                                    text-decoration: none; 
                                    padding: 16px 40px; 
                                    border-radius: 8px; 
                                    font-size: 16px; 
                                    font-weight: bold;">
                            Redefinir Minha Senha
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Aviso de expiração -->
                    <div style="background-color: #FFF9E6; border-left: 4px solid #F59E0B; padding: 15px; margin: 30px 0; border-radius: 4px;">
                      <p style="color: #92400E; margin: 0; font-size: 14px; line-height: 1.5;">
                        <strong>⏰ Atenção:</strong> Este link é válido por <strong>60 minutos</strong>. 
                        Após esse período, você precisará solicitar um novo link.
                      </p>
                    </div>
                    
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                      Se você não conseguir clicar no botão, copie e cole o link abaixo no seu navegador:
                    </p>
                    
                    <p style="background-color: #F3F4F6; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 12px; color: #4B5563; margin: 0 0 30px 0;">
                      ${resetUrl}
                    </p>
                    
                    <p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 0;">
                      Se você não solicitou esta alteração, ignore este email. Sua senha permanecerá inalterada.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                    <p style="color: #6B7280; margin: 0 0 10px 0; font-size: 14px;">
                      <strong>Juventude JIBCA</strong>
                    </p>
                    <p style="color: #9CA3AF; margin: 0; font-size: 12px;">
                      Igreja Batista Central de Americana
                    </p>
                    <p style="color: #9CA3AF; margin: 10px 0 0 0; font-size: 12px;">
                      Este é um email automático. Por favor, não responda.
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
        from: `"${process.env.EMAIL_FROM_NAME || 'Agenda JIBCA'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
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
