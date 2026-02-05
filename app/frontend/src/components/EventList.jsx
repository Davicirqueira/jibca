import React, { useState, useEffect, useCallback } from 'react';
import { eventService } from '../services/eventService';
import { confirmationService } from '../services/confirmationService';
import { useAuth } from '../context/AuthContext';
import { useRobustLoading, LoadingState } from '../hooks/useRobustLoading';
import { useToastCleanup } from '../hooks/useToastCleanup';
import EventCard from './EventCard';
import { SkeletonEventList, ErrorState, EmptyState, PageHeader } from './LoadingStates';

const EventList = ({ 
  filters = {}, 
  showCreateButton = false, 
  onCreateEvent = null,
  showConfirmationButtons = true 
}) => {
  const { isLeader } = useAuth();
  const toastManager = useToastCleanup(); // Hook com cleanup automático
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [futureOnly, setFutureOnly] = useState(true);
  
  // Hook para gerenciar loading robusto
  const {
    loadingState,
    isLoading,
    isError,
    isEmpty,
    errorMessage,
    execute,
    reset
  } = useRobustLoading(10000); // 10 segundos de timeout

  // Carregar tipos de evento (apenas uma vez)
  useEffect(() => {
    const loadEventTypes = async () => {
      try {
        const types = await eventService.getEventTypes();
        setEventTypes(types || []);
      } catch (error) {
        console.error('Erro ao carregar tipos de evento:', error);
        // Não mostrar toast para erro de tipos, é secundário
      }
    };
    loadEventTypes();
  }, []);

  // Função para carregar eventos com loading robusto
  const loadEvents = useCallback(async () => {
    const asyncOperation = async (signal) => {
      const params = {
        page: currentPage,
        limit: 12,
        future_only: futureOnly,
        ...filters
      };

      if (selectedType) {
        params.type = selectedType;
      }

      // Fazer requisição com signal para abort
      const data = await eventService.getEvents(params);
      
      // Verificar se foi abortado
      if (signal.aborted) {
        throw new Error('ABORTED');
      }

      return data;
    };

    try {
      await execute(asyncOperation, {
        emptyCheck: (data) => !data?.events || data.events.length === 0,
        showToastOnError: true,
        onSuccess: (data) => {
          setEvents(data.events || []);
          setPagination(data.pagination || {});
        },
        onEmpty: (data) => {
          setEvents([]);
          setPagination(data?.pagination || {});
        },
        onError: (error, errorMsg) => {
          console.error('Erro ao carregar eventos:', error);
          setEvents([]);
          setPagination({});
        }
      });
    } catch (error) {
      // Erro já tratado pelo hook, não fazer nada
      // Se foi abortado, o hook já tratou silenciosamente
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedType, futureOnly, JSON.stringify(filters)]);

  // Carregar eventos quando dependências mudarem
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Função para confirmar presença
  const handleConfirmPresence = async (eventId) => {
    try {
      await confirmationService.confirmPresence(eventId, 'confirmed');
      toastManager.success('Presença confirmada com sucesso!');
      
      // Recarregar eventos para atualizar contadores
      loadEvents();
    } catch (error) {
      console.error('Erro ao confirmar presença:', error);
      const errorMessage = error.response?.data?.error?.message || 'Erro ao confirmar presença';
      toastManager.error(errorMessage);
    }
  };

  // Handlers para filtros e paginação
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleTypeFilter = useCallback((typeId) => {
    setSelectedType(typeId);
    setCurrentPage(1); // Reset para primeira página
  }, []);

  const handleFutureOnlyToggle = useCallback(() => {
    setFutureOnly(prev => !prev);
    setCurrentPage(1); // Reset para primeira página
  }, []);

  const handleRetry = useCallback(() => {
    reset();
    loadEvents();
  }, [reset, loadEvents]);

  // Renderização baseada no estado
  const renderContent = () => {
    switch (loadingState) {
      case LoadingState.LOADING:
        return <SkeletonEventList count={6} />;
        
      case LoadingState.ERROR:
        return (
          <ErrorState 
            message={errorMessage}
            onRetry={handleRetry}
          />
        );
        
      case LoadingState.EMPTY:
        return (
          <EmptyState 
            futureOnly={futureOnly}
            showCreateButton={showCreateButton && isLeader() && onCreateEvent}
            onCreateEvent={onCreateEvent}
          />
        );
        
      case LoadingState.SUCCESS:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showConfirmationButton={showConfirmationButtons}
                onConfirm={handleConfirmPresence}
              />
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };

  // Calcular subtitle para o header
  const getSubtitle = () => {
    if (isLoading) return 'Carregando...';
    if (isError) return 'Erro ao carregar';
    if (isEmpty) return 'Nenhum evento encontrado';
    
    const total = pagination.total || 0;
    const typeText = futureOnly ? 'Próximos' : 'Todos';
    return `${total} evento(s) encontrado(s) • ${typeText}`;
  };

  return (
    <div className="page-container">
      {/* Header */}
      <PageHeader
        title="Eventos"
        subtitle={getSubtitle()}
        showCreateButton={showCreateButton && isLeader() && onCreateEvent}
        onCreateEvent={onCreateEvent}
        isLoading={isLoading}
      />

      {/* Filtros - apenas mostrar se não estiver em loading inicial */}
      {loadingState !== LoadingState.LOADING && (
        <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-gray-100">
          {/* Filtro por tipo */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Tipo:</label>
            <select
              value={selectedType}
              onChange={(e) => handleTypeFilter(e.target.value)}
              disabled={isLoading}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              <option value="">Todos os tipos</option>
              {eventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle eventos futuros */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <input
                type="checkbox"
                checked={futureOnly}
                onChange={handleFutureOnlyToggle}
                disabled={isLoading}
                className="mr-2 rounded focus:ring-red-500 text-red-600 disabled:opacity-50"
              />
              Apenas eventos futuros
            </label>
          </div>

          {/* Botão de refresh */}
          <button
            onClick={handleRetry}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50 flex items-center space-x-1"
          >
            <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
            <span>{isLoading ? 'Carregando...' : 'Atualizar'}</span>
          </button>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="state-transition">
        {renderContent()}
      </div>

      {/* Paginação - apenas mostrar se há múltiplas páginas e não está em loading/error */}
      {loadingState === LoadingState.SUCCESS && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          
          <span className="text-sm text-gray-600">
            Página {currentPage} de {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pagination.totalPages || isLoading}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
};

export default EventList;