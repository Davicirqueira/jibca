const EventRepository = require('../repositories/EventRepository');
const UserRepository = require('../repositories/UserRepository');
const ConfirmationRepository = require('../repositories/ConfirmationRepository');

class DashboardController {
  /**
   * Obter métricas do dashboard
   * GET /api/v1/dashboard/metrics
   */
  static async getMetrics(req, res) {
    try {
      console.log('🔍 DEBUG - Carregando métricas do dashboard...');
      console.log(`   - Usuário solicitante: ${req.user.name} (ID: ${req.user.id})`);

      // Executar todas as consultas em paralelo para melhor performance
      const [eventsCount, membersCount, confirmationsCount] = await Promise.all([
        EventRepository.countUpcomingEvents(),
        UserRepository.countActiveMembers(),
        ConfirmationRepository.countActiveConfirmations()
      ]);

      console.log('📊 Métricas coletadas:', {
        eventsCount,
        membersCount,
        confirmationsCount
      });

      // Garantir que todos os valores sejam números válidos
      const metrics = {
        eventsCount: Number.isInteger(eventsCount) ? eventsCount : 0,
        membersCount: Number.isInteger(membersCount) ? membersCount : 0,
        confirmationsCount: Number.isInteger(confirmationsCount) ? confirmationsCount : 0
      };

      console.log('✅ Métricas processadas com sucesso:', metrics);

      res.json({
        success: true,
        data: {
          metrics,
          timestamp: new Date().toISOString(),
          description: {
            eventsCount: 'Eventos programados para o futuro',
            membersCount: 'Membros ativos no sistema',
            confirmationsCount: 'Confirmações ativas para eventos futuros'
          }
        }
      });

    } catch (error) {
      console.error('❌ Erro ao buscar métricas do dashboard:', error);
      console.error('Stack trace:', error.stack);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'METRICS_ERROR',
          message: 'Erro ao carregar métricas do dashboard',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Obter estatísticas detalhadas do dashboard (opcional)
   * GET /api/v1/dashboard/stats
   */
  static async getDetailedStats(req, res) {
    try {
      console.log('🔍 DEBUG - Carregando estatísticas detalhadas...');

      // Buscar apenas estatísticas que já temos implementadas
      const userStats = await UserRepository.countByRole();

      const detailedStats = {
        users: userStats,
        timestamp: new Date().toISOString(),
        description: {
          users: 'Estatísticas de usuários por função (líder/membro)'
        }
      };

      console.log('✅ Estatísticas detalhadas coletadas:', detailedStats);

      res.json({
        success: true,
        data: detailedStats
      });

    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas detalhadas:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'DETAILED_STATS_ERROR',
          message: 'Erro ao carregar estatísticas detalhadas'
        }
      });
    }
  }
}

module.exports = DashboardController;