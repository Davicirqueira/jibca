const UserController = require('../UserController');
const UserRepository = require('../../repositories/UserRepository');
const AuthService = require('../../services/AuthService');
const { validationResult } = require('express-validator');

// Mock dos repositories e services
jest.mock('../../repositories/UserRepository');
jest.mock('../../services/AuthService');
jest.mock('express-validator');

describe('UserController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 1, role: 'leader', name: 'Test Leader' }
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

  describe('deactivate', () => {
    it('should deactivate member successfully', async () => {
      // Arrange
      req.params.id = '2';
      
      const mockDeactivatedUser = {
        id: 2,
        name: 'Test Member',
        email: 'member@test.com',
        role: 'member',
        phone: '123456789',
        avatar_url: null,
        is_active: false,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-02-02T19:40:00Z'
      };

      UserRepository.deactivate.mockResolvedValue(mockDeactivatedUser);

      // Act
      await UserController.deactivate(req, res);

      // Assert
      expect(UserRepository.deactivate).toHaveBeenCalledWith(2);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: {
            id: 2,
            name: 'Test Member',
            email: 'member@test.com',
            role: 'member',
            phone: '123456789',
            avatar_url: null,
            active: false, // Mapped from is_active
            is_active: false, // Compatibility
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-02-02T19:40:00Z'
          }
        },
        message: 'Usuário desativado com sucesso'
      });
    });

    it('should handle deactivation failure', async () => {
      // Arrange
      req.params.id = '2';
      UserRepository.deactivate.mockResolvedValue(null);

      // Act
      await UserController.deactivate(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DEACTIVATION_FAILED',
          message: 'Falha ao desativar usuário'
        }
      });
    });

    it('should handle repository errors', async () => {
      // Arrange
      req.params.id = '2';
      const error = new Error('Database error');
      UserRepository.deactivate.mockRejectedValue(error);

      // Act
      await UserController.deactivate(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DEACTIVATE_USER_ERROR',
          message: 'Erro interno ao desativar usuário'
        }
      });
    });
  });

  describe('create', () => {
    it('should create new member successfully', async () => {
      // Arrange
      req.body = {
        name: 'New Member',
        email: 'new@test.com',
        phone: '987654321',
        password: 'password123'
      };

      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      UserRepository.emailExists.mockResolvedValue(false);
      AuthService.hashPassword.mockResolvedValue('hashed_password');
      
      const mockNewUser = {
        id: 3,
        name: 'New Member',
        email: 'new@test.com',
        role: 'member',
        phone: '987654321',
        is_active: true,
        created_at: '2026-02-02T19:40:00Z'
      };
      
      UserRepository.create.mockResolvedValue(mockNewUser);

      // Act
      await UserController.create(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: {
            id: 3,
            name: 'New Member',
            email: 'new@test.com',
            role: 'member',
            phone: '987654321',
            active: true,
            is_active: true,
            created_at: '2026-02-02T19:40:00Z'
          }
        },
        message: 'Membro criado com sucesso'
      });
    });

    it('should reject duplicate email', async () => {
      // Arrange
      req.body = {
        name: 'New Member',
        email: 'existing@test.com',
        password: 'password123'
      };

      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      UserRepository.emailExists.mockResolvedValue(true);

      // Act
      await UserController.create(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Este email já está cadastrado no sistema'
        }
      });
    });

    it('should create user with role "leader" when specified', async () => {
      // Arrange
      req.body = {
        name: 'New Leader',
        email: 'leader@test.com',
        phone: '987654321',
        password: 'password123',
        role: 'leader'
      };

      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      UserRepository.emailExists.mockResolvedValue(false);
      AuthService.hashPassword.mockResolvedValue('hashed_password');
      
      const mockNewUser = {
        id: 4,
        name: 'New Leader',
        email: 'leader@test.com',
        role: 'leader',
        phone: '987654321',
        is_active: true,
        created_at: '2026-02-02T19:40:00Z'
      };
      
      UserRepository.create.mockResolvedValue(mockNewUser);

      // Act
      await UserController.create(req, res);

      // Assert
      expect(UserRepository.create).toHaveBeenCalledWith({
        name: 'New Leader',
        email: 'leader@test.com',
        password_hash: 'hashed_password',
        role: 'leader',
        phone: '987654321'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: {
            id: 4,
            name: 'New Leader',
            email: 'leader@test.com',
            role: 'leader',
            phone: '987654321',
            active: true,
            is_active: true,
            created_at: '2026-02-02T19:40:00Z'
          }
        },
        message: 'Membro criado com sucesso'
      });
    });

    it('should create user with role "member" when specified', async () => {
      // Arrange
      req.body = {
        name: 'New Member',
        email: 'member@test.com',
        password: 'password123',
        role: 'member'
      };

      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      UserRepository.emailExists.mockResolvedValue(false);
      AuthService.hashPassword.mockResolvedValue('hashed_password');
      
      const mockNewUser = {
        id: 5,
        name: 'New Member',
        email: 'member@test.com',
        role: 'member',
        phone: null,
        is_active: true,
        created_at: '2026-02-02T19:40:00Z'
      };
      
      UserRepository.create.mockResolvedValue(mockNewUser);

      // Act
      await UserController.create(req, res);

      // Assert
      expect(UserRepository.create).toHaveBeenCalledWith({
        name: 'New Member',
        email: 'member@test.com',
        password_hash: 'hashed_password',
        role: 'member',
        phone: undefined
      });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({
              role: 'member'
            })
          })
        })
      );
    });

    it('should default to "member" role when role is not specified', async () => {
      // Arrange
      req.body = {
        name: 'Default Member',
        email: 'default@test.com',
        password: 'password123'
      };

      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      UserRepository.emailExists.mockResolvedValue(false);
      AuthService.hashPassword.mockResolvedValue('hashed_password');
      
      const mockNewUser = {
        id: 6,
        name: 'Default Member',
        email: 'default@test.com',
        role: 'member',
        phone: null,
        is_active: true,
        created_at: '2026-02-02T19:40:00Z'
      };
      
      UserRepository.create.mockResolvedValue(mockNewUser);

      // Act
      await UserController.create(req, res);

      // Assert
      expect(UserRepository.create).toHaveBeenCalledWith({
        name: 'Default Member',
        email: 'default@test.com',
        password_hash: 'hashed_password',
        role: 'member',
        phone: undefined
      });
    });

    it('should reject invalid role value', async () => {
      // Arrange
      req.body = {
        name: 'Invalid Role User',
        email: 'invalid@test.com',
        password: 'password123',
        role: 'admin'
      };

      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      UserRepository.emailExists.mockResolvedValue(false);

      // Act
      await UserController.create(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_ROLE',
          message: 'Role deve ser "leader" ou "member"'
        }
      });
      expect(UserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('should return users list with active field mapping', async () => {
      // Arrange
      const mockResult = {
        users: [
          { id: 1, name: 'User 1', is_active: true },
          { id: 2, name: 'User 2', is_active: false }
        ],
        pagination: { page: 1, limit: 20, total: 2 }
      };

      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      UserRepository.list.mockResolvedValue(mockResult);

      // Act
      await UserController.list(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          users: [
            { id: 1, name: 'User 1', is_active: true, active: true },
            { id: 2, name: 'User 2', is_active: false, active: false }
          ],
          pagination: mockResult.pagination
        }
      });
    });
  });

  describe('update', () => {
    it('should update user role from member to leader', async () => {
      // Arrange
      req.params.id = '2';
      req.body = {
        role: 'leader'
      };

      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      const existingUser = {
        id: 2,
        name: 'Test User',
        email: 'test@test.com',
        role: 'member',
        is_active: true
      };

      const updatedUser = {
        ...existingUser,
        role: 'leader',
        updated_at: '2026-02-02T20:00:00Z'
      };

      UserRepository.findById.mockResolvedValue(existingUser);
      UserRepository.update.mockResolvedValue(updatedUser);

      // Act
      await UserController.update(req, res);

      // Assert
      expect(UserRepository.update).toHaveBeenCalledWith(2, { role: 'leader' });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({
              role: 'leader'
            })
          })
        })
      );
    });

    it('should update user role from leader to member', async () => {
      // Arrange
      req.params.id = '3';
      req.body = {
        role: 'member'
      };

      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      const existingUser = {
        id: 3,
        name: 'Test Leader',
        email: 'leader@test.com',
        role: 'leader',
        is_active: true
      };

      const updatedUser = {
        ...existingUser,
        role: 'member',
        updated_at: '2026-02-02T20:00:00Z'
      };

      UserRepository.findById.mockResolvedValue(existingUser);
      UserRepository.update.mockResolvedValue(updatedUser);

      // Act
      await UserController.update(req, res);

      // Assert
      expect(UserRepository.update).toHaveBeenCalledWith(3, { role: 'member' });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({
              role: 'member'
            })
          })
        })
      );
    });

    it('should ignore invalid role values in update', async () => {
      // Arrange
      req.params.id = '2';
      req.body = {
        name: 'Updated Name',
        role: 'admin' // Invalid role
      };

      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      const existingUser = {
        id: 2,
        name: 'Test User',
        email: 'test@test.com',
        role: 'member',
        is_active: true
      };

      const updatedUser = {
        ...existingUser,
        name: 'Updated Name',
        updated_at: '2026-02-02T20:00:00Z'
      };

      UserRepository.findById.mockResolvedValue(existingUser);
      UserRepository.update.mockResolvedValue(updatedUser);

      // Act
      await UserController.update(req, res);

      // Assert
      // Should only update name, not role (invalid role is ignored)
      expect(UserRepository.update).toHaveBeenCalledWith(2, { name: 'Updated Name' });
    });
  });
});