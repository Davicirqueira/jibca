import React from 'react';
import { Calendar, Plus, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Componente de skeleton loading para lista de eventos
 */
export const SkeletonEventList = ({ count = 3 }) => {
  return (
    <div className="space-y-6">
      <div className="text-center text-sm text-gray-500 mb-6">
        Carregando eventos...
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton-header" />
            <div className="skeleton-content">
              <div className="skeleton-line skeleton-line-long" />
              <div className="skeleton-line skeleton-line-medium" />
              <div className="skeleton-line skeleton-line-short" />
            </div>
            <div className="skeleton-footer" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Componente de estado de erro com retry
 */
export const ErrorState = ({ 
  message = 'Erro ao carregar eventos', 
  onRetry,
  showRetryButton = true 
}) => {
  return (
    <div className="empty-state">
      <AlertCircle className="icon-error" />
      <h3 className="empty-title">Erro ao carregar eventos</h3>
      <p className="empty-description">{message}</p>
      
      {showRetryButton && onRetry && (
        <button onClick={onRetry} className="btn-primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Novamente
        </button>
      )}
    </div>
  );
};

/**
 * Componente de estado vazio elegante
 */
export const EmptyState = ({ 
  title = 'Nenhum evento cadastrado',
  description = 'Comece criando o primeiro evento para a juventude',
  showCreateButton = false,
  onCreateEvent,
  futureOnly = false
}) => {
  const emptyTitle = futureOnly 
    ? 'Nenhum evento futuro encontrado'
    : title;
    
  const emptyDescription = futureOnly
    ? 'Não há eventos programados para o futuro no momento.'
    : description;

  return (
    <div className="empty-state">
      <Calendar className="icon-empty" />
      <h3 className="empty-title">{emptyTitle}</h3>
      <p className="empty-description">{emptyDescription}</p>
      
      {showCreateButton && onCreateEvent && (
        <button onClick={onCreateEvent} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Criar Primeiro Evento
        </button>
      )}
    </div>
  );
};

/**
 * Componente de cabeçalho da página com botão de criar
 */
export const PageHeader = ({ 
  title = 'Eventos',
  subtitle,
  showCreateButton = false,
  onCreateEvent,
  isLoading = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>

      {showCreateButton && onCreateEvent && (
        <button
          onClick={onCreateEvent}
          disabled={isLoading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Evento
        </button>
      )}
    </div>
  );
};