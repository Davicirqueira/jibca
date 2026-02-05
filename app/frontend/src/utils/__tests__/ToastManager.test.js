import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toastManager } from '../ToastManager';
import toast from 'react-hot-toast';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(() => 'toast-id-success'),
    error: vi.fn(() => 'toast-id-error'),
    info: vi.fn(() => 'toast-id-info'),
    loading: vi.fn(() => 'toast-id-loading'),
    dismiss: vi.fn(),
    promise: vi.fn()
  }
}));

// Get mocked functions
const mockedToast = vi.mocked(toast);

describe('ToastManager', () => {
  beforeEach(() => {
    // Limpar histórico de chamadas dos mocks
    vi.clearAllMocks();
    // Limpar estado antes de cada teste
    toastManager.clearAll();
  });

  describe('show method', () => {
    it('should show a toast message', () => {
      toastManager.show('Test message', 'success');

      expect(mockedToast.success).toHaveBeenCalledWith(
        'Test message',
        expect.objectContaining({
          duration: 4000,
          onClose: expect.any(Function)
        })
      );
    });

    it('should not show duplicate toast messages', () => {
      toastManager.show('Duplicate message', 'info');
      toastManager.show('Duplicate message', 'info');

      // Deve ser chamado apenas uma vez
      expect(mockedToast.info).toHaveBeenCalledTimes(1);
    });

    it('should clear existing toasts when max limit is reached', () => {
      toastManager.show('First message', 'info');
      toastManager.show('Second message', 'success');

      // Deve ter chamado dismiss para limpar toasts anteriores
      expect(mockedToast.dismiss).toHaveBeenCalled();
    });

    it('should use longer duration for error messages', () => {
      toastManager.show('Error message', 'error');

      expect(mockedToast.error).toHaveBeenCalledWith(
        'Error message',
        expect.objectContaining({
          duration: 6000
        })
      );
    });
  });

  describe('convenience methods', () => {
    it('should call show with correct type for success', () => {
      const spy = vi.spyOn(toastManager, 'show');
      toastManager.success('Success message');
      expect(spy).toHaveBeenCalledWith('Success message', 'success', {});
    });

    it('should call show with correct type for error', () => {
      const spy = vi.spyOn(toastManager, 'show');
      toastManager.error('Error message');
      expect(spy).toHaveBeenCalledWith('Error message', 'error', {});
    });

    it('should call show with correct type for info', () => {
      const spy = vi.spyOn(toastManager, 'show');
      toastManager.info('Info message');
      expect(spy).toHaveBeenCalledWith('Info message', 'info', {});
    });
  });

  describe('clearAll method', () => {
    it('should clear all active toasts', () => {
      toastManager.show('Message 1', 'info');
      toastManager.show('Message 2', 'success');

      toastManager.clearAll();

      expect(mockedToast.dismiss).toHaveBeenCalled();
      expect(toastManager.isActive('Message 1')).toBe(false);
      expect(toastManager.isActive('Message 2')).toBe(false);
    });
  });

  describe('isActive method', () => {
    it('should return true for active toasts', () => {
      toastManager.show('Active message', 'info');
      expect(toastManager.isActive('Active message')).toBe(true);
    });

    it('should return false for inactive toasts', () => {
      expect(toastManager.isActive('Non-existent message')).toBe(false);
    });
  });

  describe('getActiveCount method', () => {
    it('should return correct count of active toasts', () => {
      expect(toastManager.getActiveCount()).toBe(0);
      
      toastManager.show('Message 1', 'info');
      expect(toastManager.getActiveCount()).toBe(1);
    });
  });

  describe('dismiss method', () => {
    it('should dismiss specific toast message', () => {
      toastManager.show('Message to dismiss', 'info');
      
      toastManager.dismiss('Message to dismiss');

      expect(mockedToast.dismiss).toHaveBeenCalledWith('toast-id-info');
      expect(toastManager.isActive('Message to dismiss')).toBe(false);
    });
  });
});