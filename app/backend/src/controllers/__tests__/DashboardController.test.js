const DashboardController = require('../DashboardController');
const EventRepository = require('../../repositories/EventRepository');
const UserRepository = require('../../repositories/UserRepository');
const ConfirmationRepository = require('../../repositories/ConfirmationRepository');

// Mock dos repositories
jest.mock('../../repositories/EventRepository');
jest.mock('../../repositories/UserRepository');
jest.mock('../../repositories/ConfirmationRepository');

describe('DashboardController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 1, name: 'Test User', role: 'leader' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
    
    // Mock console.log to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  describe('getMetrics', () => {
    it('should return dashboard metrics successfully', async () => {
      // Arrange
      const mockEventsCount = 5;
      const mockMembersCount = 12;
      const mockConfirmationsCount = 8;

      EventRepository.countUpcomingEvents.mockResolvedValue(mockEventsCount);
      UserRepository.countActiveMembers.mockResolvedValue(mockMembersCount);
      ConfirmationRepository.countActiveConfirmations.mockResolvedValue(mockConfirmationsCount);

      // Act
      await DashboardController.getMetrics(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          metrics: {
            eventsCount: 5,
            membersCount: 12,
            confirmationsCount: 8
          },
          timestamp: expect.any(String),
          description: {
            eventsCount: 'Eventos programados para o futuro',
            membersCount: 'Membros ativos no sistema',
            confirmationsCount: 'Confirmações ativas para eventos futuros'
          }
        }
      });
    });

    it('should handle null values and convert to zero', async () => {
      // Arrange
      EventRepository.countUpcomingEvents.mockResolvedValue(null);
      UserRepository.countActiveMembers.mockResolvedValue(undefined);
      ConfirmationRepository.countActiveConfirmations.mockResolvedValue(3);

      // Act
      await DashboardController.getMetrics(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          metrics: {
            eventsCount: 0,
            membersCount: 0,
            confirmationsCount: 3
          },
          timestamp: expect.any(String),
          description: expect.any(Object)
        }
      });
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      EventRepository.countUpcomingEvents.mockRejectedValue(error);

      // Act
      await DashboardController.getMetrics(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'METRICS_ERROR',
          message: 'Erro ao carregar métricas do dashboard',
          timestamp: expect.any(String)
        }
      });
    });

    it('should ensure all metrics are integers', async () => {
      // Arrange
      EventRepository.countUpcomingEvents.mockResolvedValue('5'); // String
      UserRepository.countActiveMembers.mockResolvedValue(12.5); // Float
      ConfirmationRepository.countActiveConfirmations.mockResolvedValue(8);

      // Act
      await DashboardController.getMetrics(req, res);

      // Assert
      const response = res.json.mock.calls[0][0];
      
      // The controller should convert non-integers to 0
      expect(response.data.metrics.eventsCount).toBe(0); // String '5' converted to 0
      expect(response.data.metrics.membersCount).toBe(0); // 12.5 converted to 0
      expect(response.data.metrics.confirmationsCount).toBe(8); // 8 remains 8
      
      // Verify all final values are integers
      expect(Number.isInteger(response.data.metrics.eventsCount)).toBe(true);
      expect(Number.isInteger(response.data.metrics.membersCount)).toBe(true);
      expect(Number.isInteger(response.data.metrics.confirmationsCount)).toBe(true);
    });
  });

  describe('getDetailedStats', () => {
    it('should return detailed user statistics', async () => {
      // Arrange
      const mockUserStats = {
        leader: { total: 2, active: 2 },
        member: { total: 10, active: 8 }
      };

      UserRepository.countByRole.mockResolvedValue(mockUserStats);

      // Act
      await DashboardController.getDetailedStats(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          users: mockUserStats,
          timestamp: expect.any(String),
          description: {
            users: 'Estatísticas de usuários por função (líder/membro)'
          }
        }
      });
    });

    it('should handle errors in detailed stats', async () => {
      // Arrange
      const error = new Error('Stats query failed');
      UserRepository.countByRole.mockRejectedValue(error);

      // Act
      await DashboardController.getDetailedStats(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DETAILED_STATS_ERROR',
          message: 'Erro ao carregar estatísticas detalhadas'
        }
      });
    });
  });
});