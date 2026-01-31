const cron = require('node-cron');
const EventRepository = require('../repositories/EventRepository');
const NotificationRepository = require('../repositories/NotificationRepository');

class NotificationService {
  static isSchedulerRunning = false;

  /**
   * Iniciar agendador de notificações
   */
  static startNotificationScheduler() {
    if (this.isSchedulerRunning) {
      console.log('📬 Agendador de notificações já está rodando');
      return;
    }

    if (process.env.NOTIFICATION_ENABLED !== 'true') {
      console.log('📬 Notificações desabilitadas via configuração');
      return;
    }

    console.log('📬 Iniciando agendador de notificações...');

    try {
      // Job para lembretes diários (executa às 9h todos os dias)
      const dailyReminderTime = process.env.DAILY_REMINDER_TIME || '09:00';
      const [hour, minute] = dailyReminderTime.split(':');
      
      cron.schedule(`${minute} ${hour} * * *`, async () => {
        console.log('📅 Executando job de lembretes diários...');
        await this.sendDailyReminders();
      }, {
        scheduled: true,
        timezone: 'America/Sao_Paulo'
      });

      // Job para lembretes de 1 hora (executa a cada 15 minutos)
      if (process.env.HOURLY_REMINDER_ENABLED === 'true') {
        cron.schedule('*/15 * * * *', async () => {
          console.log('⏰ Verificando lembretes de 1 hora...');
          await this.sendHourlyReminders();
        }, {
          scheduled: true,
          timezone: 'America/Sao_Paulo'
        });
      }

      // Job para limpeza de notificações antigas (executa às 2h todo domingo)
      cron.schedule('0 2 * * 0', async () => {
        console.log('🧹 Executando limpeza de notificações antigas...');
        await this.cleanupOldNotifications();
      }, {
        scheduled: true,
        timezone: 'America/Sao_Paulo'
      });

      this.isSchedulerRunning = true;
      console.log('✅ Agendador de notificações iniciado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao iniciar agendador de notificações:', error.message);
      console.log('📬 Continuando sem agendador de notificações...');
    }
  }

  /**
   * Parar agendador de notificações
   */
  static stopNotificationScheduler() {
    cron.getTasks().forEach(task => task.stop());
    this.isSchedulerRunning = false;
    console.log('⏹️ Agendador de notificações parado');
  }

  /**
   * Enviar lembretes diários (24 horas antes do evento)
   */
  static async sendDailyReminders() {
    try {
      const upcomingEvents = await EventRepository.getUpcomingEvents('24h');
      
      console.log(`📅 Encontrados ${upcomingEvents.length} eventos para lembrete diário`);

      for (const event of upcomingEvents) {
        try {
          const notifications = await NotificationRepository.createReminderNotifications(
            event.id,
            event.title,
            'daily'
          );

          console.log(`📬 Enviados ${notifications.length} lembretes diários para evento: ${event.title}`);
        } catch (error) {
          console.error(`❌ Erro ao enviar lembrete diário para evento ${event.id}:`, error);
        }
      }

    } catch (error) {
      console.error('❌ Erro no job de lembretes diários:', error);
    }
  }

  /**
   * Enviar lembretes de 1 hora (apenas para usuários confirmados)
   */
  static async sendHourlyReminders() {
    try {
      const upcomingEvents = await EventRepository.getUpcomingEvents('1h');
      
      if (upcomingEvents.length > 0) {
        console.log(`⏰ Encontrados ${upcomingEvents.length} eventos para lembrete de 1 hora`);
      }

      for (const event of upcomingEvents) {
        try {
          const notifications = await NotificationRepository.createReminderNotifications(
            event.id,
            event.title,
            'hourly'
          );

          console.log(`📬 Enviados ${notifications.length} lembretes de 1 hora para evento: ${event.title}`);
        } catch (error) {
          console.error(`❌ Erro ao enviar lembrete de 1 hora para evento ${event.id}:`, error);
        }
      }

    } catch (error) {
      console.error('❌ Erro no job de lembretes de 1 hora:', error);
    }
  }

  /**
   * Notificar sobre novo evento
   * @param {number} eventId - ID do evento
   * @param {string} eventTitle - Título do evento
   * @param {Array} userIds - IDs dos usuários para notificar (opcional)
   */
  static async notifyNewEvent(eventId, eventTitle, userIds = null) {
    try {
      const notifications = await NotificationRepository.createNewEventNotifications(
        eventId,
        eventTitle,
        userIds
      );

      console.log(`📬 Enviadas ${notifications.length} notificações de novo evento: ${eventTitle}`);
      return notifications;

    } catch (error) {
      console.error('❌ Erro ao notificar novo evento:', error);
      throw error;
    }
  }

  /**
   * Notificar sobre atualização de evento
   * @param {number} eventId - ID do evento
   * @param {string} eventTitle - Título do evento
   * @param {string} updateMessage - Mensagem sobre a atualização
   * @param {Array} userIds - IDs dos usuários para notificar (opcional)
   */
  static async notifyEventUpdate(eventId, eventTitle, updateMessage, userIds = null) {
    try {
      let users;
      
      if (userIds && userIds.length > 0) {
        // Notificar usuários específicos
        const placeholders = userIds.map((_, index) => `$${index + 1}`).join(',');
        const { query } = require('../config/database');
        const result = await query(`
          SELECT id, name, email FROM users 
          WHERE id IN (${placeholders}) AND is_active = true
        `, userIds);
        users = result.rows;
      } else {
        // Notificar todos os usuários ativos
        const { query } = require('../config/database');
        const result = await query(`
          SELECT id, name, email FROM users 
          WHERE is_active = true
          ORDER BY name
        `);
        users = result.rows;
      }

      const notifications = users.map(user => ({
        user_id: user.id,
        event_id: eventId,
        type: 'event_updated',
        message: `Evento atualizado: ${eventTitle} - ${updateMessage}`
      }));

      const createdNotifications = await NotificationRepository.createBatch(notifications);

      console.log(`📬 Enviadas ${createdNotifications.length} notificações de atualização: ${eventTitle}`);
      return createdNotifications;

    } catch (error) {
      console.error('❌ Erro ao notificar atualização de evento:', error);
      throw error;
    }
  }

  /**
   * Limpeza de notificações antigas
   */
  static async cleanupOldNotifications() {
    try {
      const daysOld = parseInt(process.env.NOTIFICATION_CLEANUP_DAYS) || 90;
      const deletedCount = await NotificationRepository.cleanupOldNotifications(daysOld);
      
      console.log(`🧹 Limpeza concluída: ${deletedCount} notificações antigas removidas`);
      return deletedCount;

    } catch (error) {
      console.error('❌ Erro na limpeza de notificações:', error);
      throw error;
    }
  }

  /**
   * Enviar notificação personalizada
   * @param {Array} userIds - IDs dos usuários
   * @param {string} message - Mensagem da notificação
   * @param {string} type - Tipo da notificação (opcional)
   * @param {number} eventId - ID do evento relacionado (opcional)
   */
  static async sendCustomNotification(userIds, message, type = 'custom', eventId = null) {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        event_id: eventId,
        type,
        message
      }));

      const createdNotifications = await NotificationRepository.createBatch(notifications);

      console.log(`📬 Enviadas ${createdNotifications.length} notificações personalizadas`);
      return createdNotifications;

    } catch (error) {
      console.error('❌ Erro ao enviar notificação personalizada:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas do sistema de notificações
   */
  static async getSystemStats() {
    try {
      const stats = await NotificationRepository.getStats();
      const recentNotifications = await NotificationRepository.getRecentNotifications(10);

      return {
        stats,
        recent_notifications: recentNotifications,
        scheduler_running: this.isSchedulerRunning,
        configuration: {
          enabled: process.env.NOTIFICATION_ENABLED === 'true',
          daily_reminder_time: process.env.DAILY_REMINDER_TIME || '09:00',
          hourly_reminder_enabled: process.env.HOURLY_REMINDER_ENABLED === 'true',
          cleanup_days: parseInt(process.env.NOTIFICATION_CLEANUP_DAYS) || 90
        }
      };

    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas do sistema:', error);
      throw error;
    }
  }

  /**
   * Testar sistema de notificações (apenas para desenvolvimento)
   */
  static async testNotificationSystem() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Teste de notificações não disponível em produção');
    }

    try {
      console.log('🧪 Testando sistema de notificações...');

      // Testar lembrete diário
      await this.sendDailyReminders();
      
      // Testar lembrete de 1 hora
      await this.sendHourlyReminders();

      console.log('✅ Teste do sistema de notificações concluído');

    } catch (error) {
      console.error('❌ Erro no teste do sistema de notificações:', error);
      throw error;
    }
  }

  /**
   * Verificar saúde do sistema de notificações
   */
  static getHealthStatus() {
    return {
      scheduler_running: this.isSchedulerRunning,
      enabled: process.env.NOTIFICATION_ENABLED === 'true',
      active_jobs: cron.getTasks().size,
      configuration_valid: !!(
        process.env.DAILY_REMINDER_TIME &&
        process.env.HOURLY_REMINDER_ENABLED !== undefined
      )
    };
  }
}

module.exports = NotificationService;