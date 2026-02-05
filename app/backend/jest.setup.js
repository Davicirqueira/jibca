// Jest setup file
// Mock express-validator globally
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
  body: jest.fn(() => ({
    trim: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    isInt: jest.fn().mockReturnThis(),
    isISO8601: jest.fn().mockReturnThis(),
    toDate: jest.fn().mockReturnThis(),
    matches: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    isEmail: jest.fn().mockReturnThis(),
    normalizeEmail: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis()
  })),
  param: jest.fn(() => ({
    isInt: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis()
  })),
  query: jest.fn(() => ({
    optional: jest.fn().mockReturnThis(),
    isInt: jest.fn().mockReturnThis(),
    isIn: jest.fn().mockReturnThis(),
    trim: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis()
  }))
}));

// Suppress console output during tests unless explicitly needed
const originalConsole = { ...console };

beforeEach(() => {
  // Only suppress if not explicitly mocked in test
  if (!console.log.mockImplementation) {
    console.log = jest.fn();
  }
  if (!console.error.mockImplementation) {
    console.error = jest.fn();
  }
});

afterEach(() => {
  // Restore console if it was suppressed globally
  if (console.log.mockRestore) {
    console.log.mockRestore();
  }
  if (console.error.mockRestore) {
    console.error.mockRestore();
  }
});