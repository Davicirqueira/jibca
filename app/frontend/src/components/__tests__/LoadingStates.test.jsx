import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkeletonEventList, ErrorState, EmptyState, PageHeader } from '../LoadingStates';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn()
  }
}))

describe('LoadingStates Components', () => {
  describe('SkeletonEventList', () => {
    it('should render skeleton cards', () => {
      render(<SkeletonEventList count={3} />);
      
      expect(screen.getByText('Carregando eventos...')).toBeInTheDocument();
      
      // Verificar se há 3 skeleton cards
      const skeletonCards = document.querySelectorAll('.skeleton-card');
      expect(skeletonCards).toHaveLength(3);
    });

    it('should render default count of skeleton cards', () => {
      render(<SkeletonEventList />);
      
      const skeletonCards = document.querySelectorAll('.skeleton-card');
      expect(skeletonCards).toHaveLength(3); // Default count
    });
  });

  describe('ErrorState', () => {
    it('should render error message and retry button', () => {
      const mockRetry = vi.fn();
      render(
        <ErrorState 
          message="Erro de teste" 
          onRetry={mockRetry}
        />
      );
      
      expect(screen.getByText('Erro ao carregar eventos')).toBeInTheDocument();
      expect(screen.getByText('Erro de teste')).toBeInTheDocument();
      
      const retryButton = screen.getByText('Tentar Novamente');
      expect(retryButton).toBeInTheDocument();
      
      fireEvent.click(retryButton);
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('should not render retry button when showRetryButton is false', () => {
      render(
        <ErrorState 
          message="Erro de teste" 
          showRetryButton={false}
        />
      );
      
      expect(screen.queryByText('Tentar Novamente')).not.toBeInTheDocument();
    });
  });

  describe('EmptyState', () => {
    it('should render empty state for future events', () => {
      render(<EmptyState futureOnly={true} />);
      
      expect(screen.getByText('Nenhum evento futuro encontrado')).toBeInTheDocument();
      expect(screen.getByText('Não há eventos programados para o futuro no momento.')).toBeInTheDocument();
    });

    it('should render empty state for all events', () => {
      render(<EmptyState futureOnly={false} />);
      
      expect(screen.getByText('Nenhum evento cadastrado')).toBeInTheDocument();
      expect(screen.getByText('Comece criando o primeiro evento para a juventude')).toBeInTheDocument();
    });

    it('should render create button when enabled', () => {
      const mockCreate = vi.fn();
      render(
        <EmptyState 
          showCreateButton={true}
          onCreateEvent={mockCreate}
        />
      );
      
      const createButton = screen.getByText('Criar Primeiro Evento');
      expect(createButton).toBeInTheDocument();
      
      fireEvent.click(createButton);
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
  });

  describe('PageHeader', () => {
    it('should render title and subtitle', () => {
      render(
        <PageHeader 
          title="Eventos de Teste"
          subtitle="10 eventos encontrados"
        />
      );
      
      expect(screen.getByText('Eventos de Teste')).toBeInTheDocument();
      expect(screen.getByText('10 eventos encontrados')).toBeInTheDocument();
    });

    it('should render create button when enabled', () => {
      const mockCreate = vi.fn();
      render(
        <PageHeader 
          title="Eventos"
          showCreateButton={true}
          onCreateEvent={mockCreate}
        />
      );
      
      const createButton = screen.getByText('Novo Evento');
      expect(createButton).toBeInTheDocument();
      
      fireEvent.click(createButton);
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should disable create button when loading', () => {
      const mockCreate = vi.fn();
      render(
        <PageHeader 
          title="Eventos"
          showCreateButton={true}
          onCreateEvent={mockCreate}
          isLoading={true}
        />
      );
      
      const createButton = screen.getByText('Novo Evento');
      expect(createButton).toBeDisabled();
    });
  });
});