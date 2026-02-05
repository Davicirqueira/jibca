# Plano de Melhoria Frontend + Backend - Sistema Agenda JIBCA

## ANÁLISE CRÍTICA DOS NOVOS PROBLEMAS IDENTIFICADOS

### Problemas Backend/API (BLOQUEADORES)

**1. Criação de Eventos Falha**
- Formulário preenchido corretamente gera erro "Erro ao criar evento" + "Dados inválidos fornecidos"
- Campos validados com checkmarks verdes mas submissão falha
- Possíveis causas: validação backend inconsistente, campos obrigatórios não mapeados, formato de data/hora incompatível

**2. Desativação de Membros como Líder Falha**
- Funcionalidade crítica de gestão não operacional
- Possível problema de permissões ou endpoint quebrado

**3. Métricas Operacionais Incompletas**
- "Membros Ativos" mostra traço (-) ao invés do número
- "Eventos Programados" e "Confirmações Ativas" também afetados
- API não retorna dados ou frontend não processa resposta

**4. Página de Eventos - Loading Infinito + Múltiplos Toasts**
- Problema persistente mesmo após identificação anterior
- Spinner trava interface completamente
- Toasts de erro aparecem em cascata (5-10+ simultâneos)
- Estado vazio elegante não implementado

---

## ESTRATÉGIA DE CORREÇÃO

### Princípio Fundamental
**Frontend não pode compensar backend quebrado.** Melhorias de UX são temporárias se API não funciona. Prioridade absoluta: **diagnosticar e corrigir backend primeiro**, depois refinar frontend.

---

## FASE 0: DIAGNÓSTICO E CORREÇÃO BACKEND (CRÍTICO)
**Duração: 1-2 dias**
**Prioridade: BLOQUEANTE - nada avança sem isso**

### 0.1 Diagnóstico de Criação de Eventos
**Tempo: 2-3 horas**

#### Checklist de Investigação

**Frontend - Inspeção de Requisição:**
```javascript
// Adicionar logging detalhado no submit do formulário
const handleSubmit = async (formData) => {
  console.group('🔍 DEBUG - Criação de Evento');
  console.log('Payload enviado:', JSON.stringify(formData, null, 2));
  
  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    console.log('Status Response:', response.status);
    console.log('Headers Response:', response.headers);
    
    const data = await response.json();
    console.log('Body Response:', data);
    console.groupEnd();
    
    if (!response.ok) {
      // Detalhar erro específico retornado pelo backend
      console.error('Erro detalhado:', data);
      throw new Error(data.message || 'Falha na criação');
    }
    
    // Sucesso
    return data;
  } catch (error) {
    console.error('Erro capturado:', error);
    console.groupEnd();
    throw error;
  }
};
```

**Verificações Frontend:**
- [ ] Formato de data: backend espera ISO 8601? DD/MM/YYYY? timestamp?
- [ ] Formato de horário: string "HH:mm" ou objeto Date completo?
- [ ] Campo "Tipo de Evento": valor enviado corresponde ao enum backend?
- [ ] Campos opcionais vs obrigatórios: frontend valida mas backend rejeita?
- [ ] Encoding de caracteres: UTF-8 em títulos/descrições?

**Backend - Inspeção de Endpoint:**
```python
# Exemplo Django/Python - adicionar logging verboso
@api_view(['POST'])
def create_event(request):
    logger.info(f"📥 Request recebida: {request.data}")
    
    serializer = EventSerializer(data=request.data)
    
    if not serializer.is_valid():
        logger.error(f"❌ Validação falhou: {serializer.errors}")
        return Response({
            'message': 'Dados inválidos fornecidos',
            'errors': serializer.errors  # Retornar erros específicos
        }, status=400)
    
    try:
        event = serializer.save()
        logger.info(f"✅ Evento criado: ID {event.id}")
        return Response(EventSerializer(event).data, status=201)
    except Exception as e:
        logger.exception(f"💥 Erro ao salvar: {str(e)}")
        return Response({
            'message': 'Erro ao criar evento',
            'detail': str(e)
        }, status=500)
```

**Verificações Backend:**
- [ ] Model Event: todos os campos obrigatórios têm default ou nullable?
- [ ] Serializer: campos readonly/writeonly configurados corretamente?
- [ ] Validações customizadas: alguma regra de negócio rejeitando dados válidos?
- [ ] Foreign keys: user/creator sendo inferido da sessão corretamente?
- [ ] Timezone: conversão de datetime causando conflitos?

**Ações Imediatas:**
1. [ ] Rodar endpoint via Postman/Insomnia com payload idêntico ao frontend
2. [ ] Verificar logs do servidor durante tentativa de criação
3. [ ] Testar com dados mínimos (apenas campos obrigatórios)
4. [ ] Incrementar campos até identificar qual causa falha
5. [ ] Corrigir validação/serialização conforme necessário

---

### 0.2 Diagnóstico de Desativação de Membros
**Tempo: 1-2 horas**

#### Problema Específico
Líder não consegue desativar membros. Possíveis causas:

**1. Problema de Permissões:**
```python
# Backend - verificar decorators/permissions
@permission_classes([IsAuthenticated, IsLeader])
def deactivate_member(request, member_id):
    # Verificar se IsLeader está implementado corretamente
    pass
```

**2. Endpoint Incorreto ou Inexistente:**
```javascript
// Frontend - confirmar rota e método HTTP
const deactivateMember = async (memberId) => {
  // Deve ser PATCH /api/members/:id ou PUT /api/members/:id/deactivate?
  const response = await fetch(`/api/members/${memberId}`, {
    method: 'PATCH', // ou PUT?
    body: JSON.stringify({ active: false })
  });
};
```

**3. Estado Ativo Não Persistindo:**
```python
# Backend - verificar se campo 'active' é salvo
class Member(models.Model):
    active = models.BooleanField(default=True)
    
    def deactivate(self):
        self.active = False
        self.save()  # Isso está sendo chamado?
```

**Ações:**
- [ ] Verificar logs backend quando botão de desativar é clicado
- [ ] Confirmar endpoint correto (PATCH vs PUT, rota exata)
- [ ] Testar desativação via curl/Postman diretamente
- [ ] Verificar permissões do usuário líder logado
- [ ] Corrigir lógica de desativação conforme necessário

---

### 0.3 Diagnóstico de Métricas Operacionais
**Tempo: 2 horas**

#### Problema
Dashboard mostra traços (-) ao invés de números nas métricas.

**Causas Possíveis:**

**1. API Não Retorna Dados:**
```javascript
// Frontend - verificar resposta da API
const fetchMetrics = async () => {
  const response = await fetch('/api/dashboard/metrics');
  const data = await response.json();
  
  console.log('Métricas recebidas:', data);
  // Esperado: { eventsCount: 5, membersCount: 12, confirmationsCount: 8 }
  // Recebido: { eventsCount: null, membersCount: null, ... }?
};
```

**2. Frontend Não Processa Dados Corretamente:**
```tsx
// Componente MetricCard
function MetricCard({ value, label }) {
  return (
    <div>
      <span className="metric-value">
        {value ?? '—'} {/* Se value for null/undefined, mostra traço */}
      </span>
      <p>{label}</p>
    </div>
  );
}
```

**3. Query Backend Retorna Null:**
```python
# Backend - verificar aggregation
def get_dashboard_metrics():
    return {
        'eventsCount': Event.objects.filter(active=True).count(),
        'membersCount': Member.objects.filter(active=True).count(),
        'confirmationsCount': Confirmation.objects.filter(confirmed=True).count()
    }
```

**Ações:**
- [ ] Inspecionar Network tab: API `/dashboard/metrics` retorna dados?
- [ ] Se API retorna null: corrigir queries no backend
- [ ] Se API retorna dados: corrigir parsing no frontend
- [ ] Adicionar skeleton loading enquanto carrega
- [ ] Implementar retry automático em caso de falha
- [ ] Estado de erro: mostrar ícone de alerta + "Erro ao carregar métricas"

---

### 0.4 Correção DEFINITIVA - Página de Eventos Loading Infinito
**Tempo: 3-4 horas**
**Prioridade: CRÍTICA**

#### Problema Detalhado
Mesmo sem eventos, página não deve travar. Comportamento atual inaceitável.

#### Solução Completa - Frontend

**1. Componente com Gerenciamento de Estado Robusto:**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Loader2, Calendar, Plus, AlertCircle } from 'lucide-react';

type Event = {
  id: string;
  title: string;
  date: string;
  // outros campos
};

type LoadingState = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoadingState('loading');
    setErrorMessage('');

    // Timeout de 10 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch('/api/events', {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: Falha ao carregar eventos`);
      }

      const data = await response.json();
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Resposta inválida do servidor');
      }

      setEvents(data);
      setLoadingState(data.length === 0 ? 'empty' : 'success');

    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      
      if (error.name === 'AbortError') {
        setErrorMessage('A requisição demorou muito. Verifique sua conexão.');
      } else {
        setErrorMessage('Não foi possível carregar os eventos.');
      }
      
      setLoadingState('error');
    }
  };

  // LOADING STATE
  if (loadingState === 'loading') {
    return (
      <div className="page-container">
        <PageHeader />
        <SkeletonEventList />
      </div>
    );
  }

  // ERROR STATE
  if (loadingState === 'error') {
    return (
      <div className="page-container">
        <PageHeader />
        <ErrorState 
          message={errorMessage}
          onRetry={fetchEvents}
        />
      </div>
    );
  }

  // EMPTY STATE
  if (loadingState === 'empty') {
    return (
      <div className="page-container">
        <PageHeader />
        <EmptyState />
      </div>
    );
  }

  // SUCCESS STATE
  return (
    <div className="page-container">
      <PageHeader />
      <EventList events={events} />
    </div>
  );
}

// COMPONENTES AUXILIARES

function SkeletonEventList() {
  return (
    <div className="skeleton-container">
      <p className="skeleton-text">Carregando eventos...</p>
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton-card" />
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="empty-state">
      <AlertCircle className="icon-error" />
      <h3 className="empty-title">Erro ao carregar eventos</h3>
      <p className="empty-description">{message}</p>
      <button onClick={onRetry} className="btn-primary">
        Tentar Novamente
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <Calendar className="icon-empty" />
      <h3 className="empty-title">Nenhum evento cadastrado</h3>
      <p className="empty-description">
        Comece criando o primeiro evento para a juventude
      </p>
      <a href="/events/create" className="btn-primary">
        <Plus /> Criar Primeiro Evento
      </a>
    </div>
  );
}

function PageHeader() {
  return (
    <div className="page-header">
      <h1>Eventos</h1>
      <a href="/events/create" className="btn-primary">
        <Plus /> Novo Evento
      </a>
    </div>
  );
}
```

**2. Estilos dos Estados:**

```css
/* Loading Skeleton */
.skeleton-container {
  padding: 24px;
}

.skeleton-text {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  margin-bottom: 24px;
}

.skeleton-card {
  height: 120px;
  background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
  margin-bottom: 16px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Empty/Error State */
.empty-state {
  min-height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  background: #f9fafb;
  border-radius: 12px;
  margin: 24px;
}

.icon-empty {
  width: 80px;
  height: 80px;
  color: #8B0000;
  opacity: 0.6;
  margin-bottom: 24px;
}

.icon-error {
  width: 64px;
  height: 64px;
  color: #dc2626;
  margin-bottom: 24px;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
  text-align: center;
}

.empty-description {
  font-size: 16px;
  color: #6b7280;
  text-align: center;
  max-width: 400px;
  line-height: 1.6;
  margin-bottom: 32px;
}

.btn-primary {
  background: #8B0000;
  color: white;
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 200ms;
  text-decoration: none;
}

.btn-primary:hover {
  background: #A52A2A;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(139,0,0,0.2);
}

.btn-primary svg {
  width: 20px;
  height: 20px;
}
```

**3. Eliminação Completa de Toasts Múltiplos:**

```typescript
// Sistema de notificações com deduplicação
class ToastManager {
  private activeToasts = new Set<string>();
  private readonly maxToasts = 1; // APENAS 1 toast por vez
  
  show(message: string, type: 'success' | 'error' | 'info') {
    // Se já existe toast idêntico, ignorar
    if (this.activeToasts.has(message)) {
      return;
    }
    
    // Se já tem toast ativo, remover antes de adicionar novo
    if (this.activeToasts.size >= this.maxToasts) {
      this.clearAll();
    }
    
    this.activeToasts.add(message);
    
    // Mostrar toast (implementação específica do framework)
    toast[type](message, {
      onClose: () => {
        this.activeToasts.delete(message);
      },
      duration: type === 'error' ? 6000 : 4000
    });
  }
  
  clearAll() {
    this.activeToasts.clear();
    toast.dismiss(); // Remove todos os toasts visíveis
  }
}

export const toastManager = new ToastManager();
```

```typescript
// Uso no componente
try {
  const response = await fetch('/api/events');
  if (!response.ok) throw new Error('Falha ao carregar');
  // ...
} catch (error) {
  // APENAS UM toast de erro
  toastManager.show('Não foi possível carregar os eventos', 'error');
}
```

**Critérios de Validação:**
- ✓ Loading nunca excede 10 segundos (abortado após timeout)
- ✓ Skeleton aparece imediatamente, não spinner genérico
- ✓ Estado vazio elegante quando `events.length === 0`
- ✓ Estado de erro com botão "Tentar Novamente"
- ✓ MÁXIMO 1 toast visível por vez, nunca múltiplos
- ✓ Página nunca trava ou congela

---

## FASE 1: CORREÇÕES FRONTEND PÓS-BACKEND
**Duração: 2-3 dias**
**Dependência: Fase 0 completa**

### 1.1 Validação de Formulário Criar Evento
**Tempo: 2 horas**

**Problema:** Checkmarks verdes aparecem mesmo quando backend vai rejeitar dados.

**Solução:** Validação frontend deve espelhar regras backend exatamente.

```typescript
// Esquema de validação com Zod (ou Yup/Joi)
import { z } from 'zod';

const eventSchema = z.object({
  title: z.string()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(100, 'Título muito longo'),
  
  description: z.string()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .max(500, 'Descrição muito longa'),
  
  date: z.string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato deve ser DD/MM/AAAA')
    .refine(dateStr => {
      const [day, month, year] = dateStr.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return date >= new Date(); // Data não pode ser no passado
    }, 'Data não pode ser no passado'),
  
  time: z.string()
    .regex(/^\d{2}:\d{2}$/, 'Formato deve ser HH:MM'),
  
  location: z.string()
    .min(3, 'Local deve ter no mínimo 3 caracteres'),
  
  eventType: z.enum([
    'Culto',
    'Retiro',
    'Reunião',
    'Estudo Bíblico',
    'Confraternização',
    'Evangelismo',
    'Passeio' // ✓ Adicionar categoria faltante
  ], { errorMap: () => ({ message: 'Selecione um tipo válido' }) })
});

// No componente
const form = useForm({
  resolver: zodResolver(eventSchema)
});

// Checkmark verde só aparece se validação completa passar
const isFieldValid = (fieldName) => {
  return form.formState.isValid && !form.formState.errors[fieldName];
};
```

**Melhorias de UX:**
- [ ] Checkmark verde SÓ aparece se campo válido segundo schema
- [ ] Ícone de erro vermelho + mensagem específica para inválidos
- [ ] Validação onBlur (ao sair do campo) ao invés de onChange (tempo real)
- [ ] Desabilitar botão "Criar Evento" se form.isValid === false
- [ ] Loading state no botão durante submissão (spinner + "Criando...")

---

### 1.2 Melhoria de Feedback de Erros
**Tempo: 2 horas**

**Problema:** Mensagens genéricas "Erro ao criar evento" não ajudam usuário.

**Solução:** Parsear erros do backend e mostrar mensagens específicas por campo.

```typescript
const handleSubmit = async (data) => {
  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      // Backend retorna: { message: string, errors: { field: [messages] } }
      if (result.errors) {
        // Marcar erros específicos por campo
        Object.entries(result.errors).forEach(([field, messages]) => {
          form.setError(field, {
            message: Array.isArray(messages) ? messages[0] : messages
          });
        });
        
        toastManager.show('Corrija os erros indicados nos campos', 'error');
      } else {
        toastManager.show(result.message || 'Erro ao criar evento', 'error');
      }
      
      return;
    }
    
    // Sucesso
    toastManager.show('Evento criado com sucesso!', 'success');
    router.push('/events');
    
  } catch (error) {
    toastManager.show('Erro de conexão. Tente novamente.', 'error');
  }
};
```

**Melhorias:**
- [ ] Erros aparecem abaixo do campo específico, não apenas toast genérico
- [ ] Toast de sucesso verde após criar evento
- [ ] Redirecionamento automático para `/events` após sucesso
- [ ] Confirmação antes de sair se formulário preenchido mas não enviado

---

### 1.3 Métricas Operacionais - UI Melhorada
**Tempo: 2 horas**

**Após backend corrigido**, refinar apresentação das métricas.

```tsx
function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  trend,
  loading 
}: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-icon">
        <Icon />
      </div>
      
      <div className="metric-content">
        {loading ? (
          <div className="metric-skeleton" />
        ) : (
          <>
            <div className="metric-value-row">
              <span className="metric-value">
                {value !== null ? value : '—'}
              </span>
              {trend && (
                <span className={`metric-trend ${trend > 0 ? 'positive' : 'negative'}`}>
                  {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </span>
              )}
            </div>
            
            <p className="metric-label">{label}</p>
            <p className="metric-description">
              {getDescription(label)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function getDescription(label: string): string {
  const descriptions = {
    'Eventos Programados': 'Aguardando integração de dados',
    'Membros Ativos': 'Cadastros validados no sistema',
    'Confirmações Ativas': 'Participações confirmadas'
  };
  return descriptions[label] || '';
}
```

**Melhorias:**
- [ ] Skeleton loading durante carregamento inicial
- [ ] Ícones coloridos (azul eventos, verde membros, roxo confirmações)
- [ ] Descrição auxiliar abaixo do número
- [ ] Indicador de tendência opcional (↑ 12% vs mês anterior)
- [ ] Tooltip com informações adicionais ao hover
- [ ] Animação de contagem numérica (count-up effect)

---

## FASE 2: POLISH E REFINAMENTOS FINAIS
**Duração: 2 dias**
**Dependência: Fase 0 e 1 completas**

### 2.1 Adicionar Categoria "Passeio" nos Tipos de Evento
**Tempo: 30 minutos**

**Backend:**
```python
# models.py
class Event(models.Model):
    EVENT_TYPES = [
        ('culto', 'Culto'),
        ('retiro', 'Retiro'),
        ('reuniao', 'Reunião'),
        ('estudo', 'Estudo Bíblico'),
        ('confraternizacao', 'Confraternização'),
        ('evangelismo', 'Evangelismo'),
        ('passeio', 'Passeio'),  # ✓ Adicionar
    ]
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
```

**Frontend:**
```typescript
const eventTypes = [
  { value: 'culto', label: 'Culto', color: '#3b82f6' },
  { value: 'retiro', label: 'Retiro', color: '#8b5cf6' },
  { value: 'reuniao', label: 'Reunião', color: '#f59e0b' },
  { value: 'estudo', label: 'Estudo Bíblico', color: '#6366f1' },
  { value: 'confraternizacao', label: 'Confraternização', color: '#ec4899' },
  { value: 'evangelismo', label: 'Evangelismo', color: '#8B0000' },
  { value: 'passeio', label: 'Passeio', color: '#10b981' }, // ✓ Adicionar
];
```

**Locais para atualizar:**
- [ ] Select no formulário de criação/edição
- [ ] Legenda do calendário
- [ ] Filtros de eventos
- [ ] Seeds/fixtures de teste

---

### 2.2 Footer Institucional Atualizado
**Tempo: 15 minutos**

**Implementação:**
```tsx
function Footer() {
  return (
    <footer className="app-footer">
      <p className="footer-text">
        © {new Date().getFullYear()} JIBCA - Juventude da Igreja Batista Castro Alves
      </p>
    </footer>
  );
}
```

```css
.app-footer {
  background: #fafafa;
  border-top: 1px solid #e5e7eb;
  padding: 24px;
  text-align: center;
  margin-top: auto;
}

.footer-text {
  font-size: 14px;
  color: #6b7280;
}
```

---

### 2.3 Versículo Atualizado
**Tempo: 20 minutos**

**Implementar em dashboard ou página de login:**
```tsx
<div className="biblical-verse">
  <BookOpenIcon className="verse-icon" />
  <blockquote>"Ninguém o despreze pelo fato de você ser jovem"</blockquote>
  <cite>1 Timóteo 4:12</cite>
  <p className="verse-context">Fundamento espiritual da juventude JIBCA</p>
</div>
```

---

## CRONOGRAMA REVISADO

| Fase | Foco | Duração | Bloqueadores |
|------|------|---------|--------------|
| **Fase 0** | Correção Backend/API | 1-2 dias | Acesso ao código backend |
| **Fase 1** | Correção Frontend Dependente | 2-3 dias | Fase 0 completa |
| **Fase 2** | Polish Final | 2 dias | Fase 1 completa |
| **TOTAL** | | **5-7 dias úteis** | |

---

## PRIORIDADES IMEDIATAS (HOJE/AMANHÃ)

**Prioridade 1 - BLOQUEANTE:**
1. ✓ Investigar logs backend durante criação de evento
2. ✓ Corrigir validação/serialização causando rejeição
3. ✓ Testar criação via Postman até funcionar
4. ✓ Implementar estado vazio elegante em /events (frontend pode fazer independente)
5. ✓ Eliminar toasts múltiplos (implementar ToastManager com deduplicação)

**Prioridade 2 - ALTA:**
6. Diagnosticar endpoint de métricas operacionais
7. Corrigir desativação de membros por líder
8. Adicionar categoria "Passeio"

**Prioridade 3 - MÉDIA:**
9. Refinar validação frontend do formulário
10. Atualizar footer e versículo

---

## OBSERVAÇÕES FINAIS

O sistema está **85% funcional** mas com bugs críticos que impedem uso produtivo:
- ❌ Não é possível criar eventos
- ❌ Não é possível gerenciar membros adequadamente
- ❌ Métricas não carregam
- ❌ Página de eventos trava interface

**Sem correção backend, melhorias de UI são cosméticas.** Foco absoluto: Fase 0 primeiro.


Confirme que entendeu o que precisa ser feito.