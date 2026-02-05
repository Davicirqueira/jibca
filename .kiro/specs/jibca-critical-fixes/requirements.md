# Requirements Document - Sistema JIBCA Correções Críticas

## Introduction

This specification addresses critical backend and frontend issues in the JIBCA (Juventude da Igreja Batista Castro Alves) system that are preventing normal operation. The system currently has four major blocking issues: event creation failures, member management problems, dashboard metrics not loading, and infinite loading states in the events page. These issues must be resolved systematically to restore full functionality.

## Glossary

- **JIBCA_System**: The complete web application for managing youth church activities
- **Event_Creation_API**: Backend endpoint responsible for creating new events
- **Member_Management_API**: Backend endpoint for managing member status and permissions
- **Dashboard_Metrics_API**: Backend endpoint providing operational statistics
- **Events_Page**: Frontend page displaying list of events with loading states
- **Leader_User**: User with administrative privileges to manage members
- **Toast_Manager**: Frontend notification system for user feedback

## Requirements

### Requirement 1

**User Story:** As a leader, I want to create new events through the web interface, so that I can schedule activities for the youth group.

#### Acceptance Criteria

1. WHEN a leader submits a valid event form with all required fields THEN the JIBCA_System SHALL create the event and store it in the database
2. WHEN the Event_Creation_API receives invalid data THEN the JIBCA_System SHALL return specific validation errors for each field
3. WHEN event creation succeeds THEN the JIBCA_System SHALL redirect the user to the events list page
4. WHEN event creation fails due to server errors THEN the JIBCA_System SHALL display a clear error message with retry option
5. WHEN a user fills the event form THEN the JIBCA_System SHALL validate fields in real-time and show appropriate visual feedback

### Requirement 2

**User Story:** As a leader, I want to deactivate members when necessary, so that I can manage the active membership roster effectively.

#### Acceptance Criteria

1. WHEN a Leader_User attempts to deactivate a member THEN the JIBCA_System SHALL update the member's active status to false
2. WHEN member deactivation succeeds THEN the JIBCA_System SHALL reflect the change immediately in the member list
3. WHEN a Leader_User lacks proper permissions THEN the JIBCA_System SHALL prevent the deactivation and show an authorization error
4. WHEN the Member_Management_API is unavailable THEN the JIBCA_System SHALL display a clear error message and maintain current state
5. WHEN deactivation is successful THEN the JIBCA_System SHALL log the action for audit purposes

### Requirement 3

**User Story:** As a user, I want to see accurate operational metrics on the dashboard, so that I can understand the current status of events, members, and confirmations.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the JIBCA_System SHALL display current counts for active members, scheduled events, and active confirmations
2. WHEN the Dashboard_Metrics_API returns data THEN the JIBCA_System SHALL format and display the numbers correctly
3. WHEN metrics data is unavailable THEN the JIBCA_System SHALL show a loading skeleton followed by an error state if loading fails
4. WHEN metrics fail to load THEN the JIBCA_System SHALL provide a retry mechanism for users
5. WHEN displaying metrics THEN the JIBCA_System SHALL include descriptive labels and context for each metric

### Requirement 4

**User Story:** As a user, I want the events page to load properly and show appropriate states, so that I can view and manage events without interface freezing.

#### Acceptance Criteria

1. WHEN the Events_Page loads THEN the JIBCA_System SHALL show a loading skeleton for maximum 10 seconds before timing out
2. WHEN no events exist THEN the JIBCA_System SHALL display an elegant empty state with call-to-action to create the first event
3. WHEN events loading fails THEN the JIBCA_System SHALL show an error state with retry button instead of infinite loading
4. WHEN displaying error messages THEN the JIBCA_System SHALL show maximum one toast notification at a time
5. WHEN the Events_Page encounters errors THEN the JIBCA_System SHALL never freeze or become unresponsive

### Requirement 5

**User Story:** As a leader, I want to categorize events including recreational activities, so that I can properly organize different types of youth activities.

#### Acceptance Criteria

1. WHEN creating or editing an event THEN the JIBCA_System SHALL provide "Passeio" as a valid event type option
2. WHEN displaying events THEN the JIBCA_System SHALL show the correct category for all event types including "Passeio"
3. WHEN filtering events by type THEN the JIBCA_System SHALL include "Passeio" events in the filtering options
4. WHEN validating event data THEN the JIBCA_System SHALL accept "Passeio" as a valid event type
5. WHEN displaying event calendars THEN the JIBCA_System SHALL use appropriate visual styling for "Passeio" events

### Requirement 6

**User Story:** As a user, I want to see improved form validation feedback, so that I can understand exactly what needs to be corrected before submitting forms.

#### Acceptance Criteria

1. WHEN a user fills form fields THEN the JIBCA_System SHALL validate each field according to backend requirements
2. WHEN validation passes for a field THEN the JIBCA_System SHALL show a green checkmark indicator
3. WHEN validation fails for a field THEN the JIBCA_System SHALL show specific error messages below the field
4. WHEN the form has validation errors THEN the JIBCA_System SHALL disable the submit button until all errors are resolved
5. WHEN backend returns field-specific errors THEN the JIBCA_System SHALL map those errors to the corresponding form fields

### Requirement 7

**User Story:** As a user, I want to see updated branding and inspirational content, so that the application reflects the current identity and mission of JIBCA.

#### Acceptance Criteria

1. WHEN viewing the application footer THEN the JIBCA_System SHALL display the current year and full organization name
2. WHEN accessing the dashboard or login page THEN the JIBCA_System SHALL show the biblical verse "Ninguém o despreze pelo fato de você ser jovem" from 1 Timóteo 4:12
3. WHEN displaying the biblical verse THEN the JIBCA_System SHALL include appropriate context about JIBCA's spiritual foundation
4. WHEN the application loads THEN the JIBCA_System SHALL maintain consistent branding throughout all pages
5. WHEN users interact with the interface THEN the JIBCA_System SHALL reflect the welcoming and youth-focused identity of the organization