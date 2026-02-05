const EventController = require('../EventController');
const EventRepository = require('../../repositories/EventRepository');
const { validationResult } = require('express-validator');

// Mock do EventRepository e express-validator
jest.mock('../../repositories/EventRepository');
jest.mock('express-validator');

describe('EventController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 1, role: 'leader', name: 'Test User' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create event successfully with valid data', async () => {
      // Arrange
      const eventData = {
        title: 'Test Event',
        description: 'Test Description',
        event_type_id: 1,
        date: '2026-03-01',
        time: '10:00',
        location: 'Test Location'
      };
      
      req.body = eventData;

      const mockEventTypes = [{ id: 1, name: 'Culto' }];
      const mockNewEvent = { id: 1, ...eventData, created_by: 1 };
      const mockCompleteEvent = { ...mockNewEvent, event_type_name: 'Culto' };

      // Mock validation result - no errors
      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      EventRepository.getEventTypes.mockResolvedValue(mockEventTypes);
      EventRepository.create.mockResolvedValue(mockNewEvent);
      EventRepository.findById.mockResolvedValue(mockCompleteEvent);

      // Act
      await EventController.create(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { event: mockCompleteEvent },
        message: 'Evento criado com sucesso'
      });
    });

    it('should return validation error for invalid data', async () => {
      // Arrange
      req.body = { title: '' }; // Invalid data

      // Mock validation result - with errors
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [
          { path: 'title', msg: 'Título é obrigatório' },
          { path: 'date', msg: 'Data é obrigatória' }
        ]
      });

      // Act
      await EventController.create(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos fornecidos',
          details: {
            title: 'Título é obrigatório',
            date: 'Data é obrigatória'
          }
        }
      });
    });

    it('should reject past dates', async () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      req.body = {
        title: 'Test Event',
        event_type_id: 1,
        date: pastDate.toISOString().split('T')[0],
        time: '10:00'
      };

      // Mock validation result - no validation errors
      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      // Act
      await EventController.create(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_DATE',
          message: 'Não é possível criar eventos em datas passadas'
        }
      });
    });
  });

  describe('list', () => {
    it('should return events list successfully', async () => {
      // Arrange
      const mockResult = {
        events: [
          { id: 1, title: 'Event 1', date: '2026-03-01' },
          { id: 2, title: 'Event 2', date: '2026-03-02' }
        ],
        pagination: { page: 1, limit: 20, total: 2 }
      };

      // Mock validation result - no errors
      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      EventRepository.list.mockResolvedValue(mockResult);

      // Act
      await EventController.list(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          events: mockResult.events,
          pagination: mockResult.pagination
        }
      });
    });
  });

  describe('getEventTypes', () => {
    it('should return event types including Passeio', async () => {
      // Arrange
      const mockEventTypes = [
        { id: 1, name: 'Culto', color: '#3b82f6' },
        { id: 2, name: 'Retiro', color: '#8b5cf6' },
        { id: 7, name: 'Passeio', color: '#10b981' }
      ];

      EventRepository.getEventTypes.mockResolvedValue(mockEventTypes);

      // Act
      await EventController.getEventTypes(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { event_types: mockEventTypes }
      });
      
      // Verify Passeio is included
      const passeioType = mockEventTypes.find(type => type.name === 'Passeio');
      expect(passeioType).toBeDefined();
      expect(passeioType.id).toBe(7);
    });
  });
});