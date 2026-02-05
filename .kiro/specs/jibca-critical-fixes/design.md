# Design Document - Sistema JIBCA Correções Críticas

## Overview

This design addresses critical system failures in the JIBCA youth management system that are preventing normal operation. The system is built with a Node.js/Express backend using PostgreSQL and a React frontend with Vite. The current architecture is sound, but specific implementation issues in API endpoints, data validation, error handling, and frontend state management need systematic correction.

The fixes are organized into three phases: backend API corrections (critical), frontend improvements (dependent), and polish refinements (final). This approach ensures that foundational issues are resolved before cosmetic improvements.

## Architecture

### Current Technology Stack
- **Backend**: Node.js 18+, Express 4.18, PostgreSQL with pg driver
- **Frontend**: React 18, Vite 5, TailwindCSS, React Router 6
- **Testing**: Jest (backend), Vitest (frontend), fast-check for property-based testing
- **State Management**: React Context API, React Hook Form
- **Notifications**: react-hot-toast
- **Authentication**: JWT tokens with bcrypt password hashing

### System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │────│  Express API    │────│   PostgreSQL    │
│   (Port 5173)   │    │  (Port 3000)    │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### API Structure
- `/api/v1/auth` - Authentication endpoints
- `/api/v1/users` - Member management
- `/api/v1/events` - Event CRUD operations
- `/api/v1/confirmations` - Event confirmations
- `/api/v1/notifications` - User notifications

## Components and Interfaces

### Backend API Corrections

#### 1. Event Creation API Enhancement
**Current Issue**: Event creation fails despite frontend validation passing.

**Root Cause Analysis**:
- Validation mismatch between frontend and backend schemas
- Date/time format inconsistencies
- Missing event type validation
- Incomplete error response formatting

**Solution Design**:
```javascript
// Enhanced validation middleware
const eventValidationRules = [
  body('title').trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('event_type_id').isInt({ min: 1 }),
  body('date').isISO8601().toDate(),
  body('time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('location').optional().trim().isLength({ max: 200 }),
  body('duration_minutes').optional().isInt({ min: 15, max: 480 })
];

// Improved error response format
const formatValidationErrors = (errors) => ({
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Dados inválidos fornecidos',
    details: errors.array().reduce((acc, err) => {
      acc[err.path] = err.msg;
      return acc;
    }, {})
  }
});
```

#### 2. Member Deactivation API Fix
**Current Issue**: Leaders cannot deactivate members.

**Solution Design**:
```javascript
// Enhanced permission checking
const canDeactivateMember = async (requesterId, targetId, requesterRole) => {
  if (requesterId === targetId) return false; // Cannot deactivate self
  if (requesterRole !== 'leader') return false; // Only leaders can deactivate
  
  const targetUser = await UserRepository.findById(targetId);
  if (targetUser.role === 'leader') return false; // Cannot deactivate other leaders
  
  return true;
};

// Improved deactivation endpoint
static async deactivate(req, res) {
  const { id } = req.params;
  const canDeactivate = await canDeactivateMember(req.user.id, parseInt(id), req.user.role);
  
  if (!canDeactivate) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'DEACTIVATION_DENIED',
        message: 'Você não tem permissão para desativar este usuário'
      }
    });
  }
  
  // Proceed with deactivation...
}
```

#### 3. Dashboard Metrics API Implementation
**Current Issue**: Metrics endpoint returns null values.

**Solution Design**:
```javascript
// New dashboard metrics endpoint
static async getDashboardMetrics(req, res) {
  try {
    const [eventsCount, membersCount, confirmationsCount] = await Promise.all([
      EventRepository.countUpcomingEvents(),
      UserRepository.countActiveMembers(),
      ConfirmationRepository.countActiveConfirmations()
    ]);

    res.json({
      success: true,
      data: {
        metrics: {
          eventsCount: eventsCount || 0,
          membersCount: membersCount || 0,
          confirmationsCount: confirmationsCount || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'METRICS_ERROR',
        message: 'Erro ao carregar métricas'
      }
    });
  }
}
```

### Frontend State Management Improvements

#### 1. Robust Loading States
**Current Issue**: Infinite loading and multiple error toasts.

**Solution Design**:
```typescript
type LoadingState = 'idle' | 'loading' | 'success' | 'error' | 'empty';

interface EventsPageState {
  events: Event[];
  loadingState: LoadingState;
  errorMessage: string;
}

// Timeout-based fetch with abort controller
const fetchWithTimeout = async (url: string, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};
```

#### 2. Toast Management System
**Current Issue**: Multiple error toasts appearing simultaneously.

**Solution Design**:
```typescript
class ToastManager {
  private activeToasts = new Set<string>();
  private readonly maxToasts = 1;
  
  show(message: string, type: 'success' | 'error' | 'info') {
    if (this.activeToasts.has(message)) return;
    
    if (this.activeToasts.size >= this.maxToasts) {
      toast.dismiss();
      this.activeToasts.clear();
    }
    
    this.activeToasts.add(message);
    toast[type](message, {
      onClose: () => this.activeToasts.delete(message)
    });
  }
}
```

## Data Models

### Enhanced Event Model
```sql
-- Add missing "Passeio" event type
INSERT INTO event_types (name, color, icon) VALUES
    ('Passeio', '#10B981', 'map-pin');
```

### Validation Schema Alignment
```typescript
// Frontend validation schema (Zod)
const eventSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  event_type_id: z.number().int().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  location: z.string().max(200).optional(),
  duration_minutes: z.number().int().min(15).max(480).optional()
});
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- Properties 1.1 and 1.2 can be combined into a comprehensive event creation validation property
- Properties 2.1, 2.2, and 2.5 can be consolidated into a single member deactivation property
- Properties 3.1 and 3.2 can be combined into a dashboard metrics display property
- Properties 6.1, 6.2, and 6.3 can be consolidated into a comprehensive form validation property

### Core Properties

**Property 1: Event creation validation and storage**
*For any* valid event data submitted by a leader, the system should successfully create and store the event, and for any invalid event data, the system should return specific field-level validation errors
**Validates: Requirements 1.1, 1.2**

**Property 2: Event creation UI flow**
*For any* successful event creation, the system should redirect to the events list page, and for any failed creation, the system should display clear error messages with retry options
**Validates: Requirements 1.3, 1.4**

**Property 3: Real-time form validation feedback**
*For any* form field input, the system should provide immediate visual feedback indicating validation status according to backend requirements
**Validates: Requirements 1.5, 6.1, 6.2, 6.3**

**Property 4: Member deactivation by leaders**
*For any* valid leader-member combination, when a leader attempts to deactivate a member, the system should update the member's status, reflect the change in the UI, and log the action for audit purposes
**Validates: Requirements 2.1, 2.2, 2.5**

**Property 5: Permission-based deactivation control**
*For any* unauthorized deactivation attempt (non-leader user, self-deactivation, or leader-to-leader), the system should prevent the action and show appropriate authorization errors
**Validates: Requirements 2.3**

**Property 6: Dashboard metrics display**
*For any* dashboard load, the system should display current counts for active members, scheduled events, and active confirmations with proper formatting and descriptive labels
**Validates: Requirements 3.1, 3.2, 3.5**

**Property 7: Events page loading timeout**
*For any* events page load, the system should show loading skeleton for maximum 10 seconds before timing out and showing error state
**Validates: Requirements 4.1**

**Property 8: Toast notification management**
*For any* error conditions, the system should display maximum one toast notification at a time, preventing multiple simultaneous error messages
**Validates: Requirements 4.4**

**Property 9: Event type display consistency**
*For any* event including "Passeio" type, the system should display the correct category consistently across all views (list, calendar, details)
**Validates: Requirements 5.2**

**Property 10: Form validation state management**
*For any* form with validation errors, the system should disable the submit button until all errors are resolved, and map backend field-specific errors to corresponding form fields
**Validates: Requirements 6.4, 6.5**

<function_calls>
<invoke name="prework">
<parameter name="featureName">jibca-critical-fixes

## Error Handling

### Backend Error Response Standardization
All API endpoints will return consistent error response format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly message",
    "details": {} // Field-specific errors for validation
  }
}
```

### Frontend Error Boundaries
- Implement React Error Boundaries to catch and handle component crashes
- Graceful degradation when API endpoints are unavailable
- Timeout handling for all network requests (10-second maximum)
- Retry mechanisms for transient failures

### Validation Error Mapping
- Frontend validation schemas must mirror backend validation rules exactly
- Real-time validation feedback using the same rules as backend
- Clear field-level error messages instead of generic form errors
- Visual indicators (checkmarks, error icons) based on validation state

## Testing Strategy

### Dual Testing Approach
The system will use both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit tests** verify specific examples, edge cases, and error conditions
- **Property tests** verify universal properties that should hold across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Property-Based Testing Implementation
- **Framework**: fast-check library for JavaScript/TypeScript
- **Configuration**: Minimum 100 iterations per property test
- **Tagging**: Each property-based test tagged with format: `**Feature: jibca-critical-fixes, Property {number}: {property_text}**`
- **Coverage**: Each correctness property implemented by a single property-based test

### Unit Testing Guidelines
- Unit tests cover specific examples that demonstrate correct behavior
- Integration points between components tested with concrete scenarios
- Edge cases and error conditions verified with specific test cases
- Minimal test solutions avoiding over-testing

### Test Organization
- Backend tests: Jest with supertest for API testing
- Frontend tests: Vitest with React Testing Library
- Property tests: fast-check generators for realistic test data
- Test files co-located with source code using `.test.js/.test.ts` suffix

### Testing Requirements
- All new functionality must include both unit and property tests
- Tests must validate real functionality without mocks where possible
- Property tests must reference specific correctness properties from this design
- Maximum 2 attempts to fix failing tests before requesting user guidance
- Tests must pass before considering any task complete