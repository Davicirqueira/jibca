# Implementation Plan - Sistema JIBCA Correções Críticas

## Phase 0: Critical Backend API Fixes

- [x] 1. Diagnose and fix event creation API endpoint


  - Investigate validation mismatch between frontend and backend
  - Add comprehensive logging to EventController.create method
  - Fix date/time format handling and validation rules
  - Ensure event_type_id validation works with existing types
  - Test event creation via Postman with identical frontend payload
  - _Requirements: 1.1, 1.2_

- [ ]* 1.1 Write property test for event creation validation
  - **Property 1: Event creation validation and storage**
  - **Validates: Requirements 1.1, 1.2**





- [x] 2. Fix member deactivation functionality for leaders


  - Debug UserController.deactivate method permission checking
  - Verify canDeactivateMember logic handles all edge cases
  - Ensure database update actually persists is_active = false
  - Test deactivation endpoint directly via API calls
  - _Requirements: 2.1, 2.3_

- [ ]* 2.1 Write property test for member deactivation
  - **Property 4: Member deactivation by leaders**
  - **Validates: Requirements 2.1, 2.2, 2.5**



- [ ]* 2.2 Write property test for deactivation permissions
  - **Property 5: Permission-based deactivation control**
  - **Validates: Requirements 2.3**

- [x] 3. Implement dashboard metrics API endpoint



  - Create new /api/v1/dashboard/metrics endpoint
  - Implement EventRepository.countUpcomingEvents method
  - Implement UserRepository.countActiveMembers method
  - Implement ConfirmationRepository.countActiveConfirmations method
  - Ensure all count methods return integers, never null
  - _Requirements: 3.1, 3.2_

- [ ]* 3.1 Write property test for dashboard metrics
  - **Property 6: Dashboard metrics display**
  - **Validates: Requirements 3.1, 3.2, 3.5**

- [x] 4. Add "Passeio" event type to database



  - Insert new event type into event_types table
  - Update any seed data or fixtures to include new type
  - Verify EventController.getEventTypes returns new type
  - _Requirements: 5.1, 5.4_

- [x] 5. Checkpoint - Ensure all backend tests pass



  - Ensure all tests pass, ask the user if questions arise.

## Phase 1: Frontend State Management and Error Handling

- [x] 6. Fix events page infinite loading issue







  - Implement robust loading state management with timeout
  - Create LoadingState type and proper state transitions
  - Add AbortController for request timeout after 10 seconds
  - Implement elegant empty state when no events exist
  - Replace infinite loading with error state and retry button
  - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 6.1 Write property test for events page loading timeout
  - **Property 7: Events page loading timeout**
  - **Validates: Requirements 4.1**

- [x] 7. Implement toast notification management system



  - Create ToastManager class with deduplication logic
  - Limit maximum simultaneous toasts to 1
  - Replace all direct toast calls with ToastManager.show
  - Ensure toast cleanup on component unmount
  - _Requirements: 4.4_

- [ ]* 7.1 Write property test for toast management
  - **Property 8: Toast notification management**
  - **Validates: Requirements 4.4**

- [x] 8. Enhance form validation with real-time feedback



  - Align frontend validation schema exactly with backend rules
  - Implement visual feedback (checkmarks, error icons) based on validation
  - Add field-level error message display below each input
  - Disable submit button when form has validation errors
  - Map backend field-specific errors to form fields
  - _Requirements: 1.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 8.1 Write property test for form validation feedback
  - **Property 3: Real-time form validation feedback**
  - **Validates: Requirements 1.5, 6.1, 6.2, 6.3**

- [ ]* 8.2 Write property test for form state management
  - **Property 10: Form validation state management**
  - **Validates: Requirements 6.4, 6.5**

- [x] 9. Implement proper event creation UI flow
  - Add success redirect to events list after creation
  - Implement clear error messages with retry options for failures
  - Add loading state to create button during submission
  - _Requirements: 1.3, 1.4_

- [ ]* 9.1 Write property test for event creation UI flow
  - **Property 2: Event creation UI flow**
  - **Validates: Requirements 1.3, 1.4**

- [x] 10. Update frontend to handle "Passeio" event type
  - Add "Passeio" option to event type selectors
  - Update event display components to show "Passeio" category
  - Add "Passeio" to filtering options
  - Ensure calendar styling includes "Passeio" events
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ]* 10.1 Write property test for event type display consistency
  - **Property 9: Event type display consistency**
  - **Validates: Requirements 5.2**

- [x] 11. Checkpoint - Ensure all frontend tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: Polish and Branding Updates

- [x] 12. Update application footer with current branding


  - Display current year dynamically
  - Show full organization name "JIBCA - Juventude da Igreja Batista Castro Alves"
  - Apply consistent styling across all pages
  - _Requirements: 7.1_

- [x] 13. Add biblical verse to dashboard and login pages


  - Display verse "Ninguém o despreze pelo fato de você ser jovem" from 1 Timóteo 4:12
  - Include context about JIBCA's spiritual foundation
  - Style appropriately with book icon and proper typography
  - _Requirements: 7.2, 7.3_

- [x] 14. Final integration testing and validation


  - Test complete event creation flow end-to-end
  - Verify member deactivation works for leaders
  - Confirm dashboard metrics display correctly
  - Validate all error states show appropriate messages
  - Ensure no infinite loading or multiple toasts occur
  - _Requirements: All_

- [x] 15. Final Checkpoint - Complete system validation



  - Ensure all tests pass, ask the user if questions arise.