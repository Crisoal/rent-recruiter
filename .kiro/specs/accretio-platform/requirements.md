# Requirements Document

## Introduction

Accretio is a full-stack web platform that connects clients (companies or hiring managers) with independent recruiters on a hire or rent basis. Clients can post requisitions, browse recruiter profiles, and send direct engagement requests. Recruiters can manage their profiles, browse open requisitions, apply to them, and respond to direct requests. An admin role oversees requisition approval and user management. The platform is built with React + Tailwind CSS on the frontend, Node.js + Express on the backend, PostgreSQL via Supabase for the database, and Supabase Auth for authentication.

## Glossary

- **Accretio**: The name of the platform
- **Client**: A registered user who posts requisitions and engages recruiters
- **Recruiter**: A registered user who applies to requisitions and accepts direct engagement requests
- **Admin**: A pre-seeded platform operator who approves requisitions and manages users
- **Requisition**: A job or engagement brief posted by a client, subject to admin approval before recruiters can view it
- **Application**: A recruiter's response to an open requisition, including a cover note
- **Direct_Request**: A client-initiated engagement request sent directly to a specific recruiter
- **Engagement_Type**: The mode of engagement — either "Hire" (permanent placement) or "Rent" (temporary/contract)
- **Availability_Status**: A recruiter's current availability — one of "Available", "Busy", or "Open to offers"
- **System**: The Accretio platform as a whole
- **Auth_Service**: The Supabase Auth subsystem responsible for authentication and session management
- **API**: The Node.js + Express backend REST API
- **UI**: The React + Tailwind CSS frontend application

---

## Requirements

### Requirement 1: User Registration and Role Selection

**User Story:** As a visitor, I want to register an account and select my role, so that I can access the appropriate dashboard and features for my use case.

#### Acceptance Criteria

1. WHEN a visitor submits the sign-up form with a valid email, password, and selected role (Client or Recruiter), THE Auth_Service SHALL create a new user account and store the role in the users table
2. WHEN a visitor submits the sign-up form with an email that is already registered, THE System SHALL display an inline error message indicating the email is already in use
3. WHEN a visitor submits the sign-up form with a password shorter than 8 characters, THE System SHALL display an inline validation error before submission
4. WHEN a visitor submits the sign-up form without selecting a role, THE System SHALL prevent submission and display an inline validation error
5. THE System SHALL NOT provide a self-registration path for the Admin role
6. WHEN a new user account is successfully created, THE System SHALL redirect the user to their role-specific dashboard

---

### Requirement 2: User Authentication

**User Story:** As a registered user, I want to log in and log out securely, so that I can access my account and protect it when I'm done.

#### Acceptance Criteria

1. WHEN a registered user submits the login form with correct credentials, THE Auth_Service SHALL issue a JWT session token and redirect the user to their role-specific dashboard
2. WHEN a user submits the login form with incorrect credentials, THE System SHALL display an inline error message without revealing which field is incorrect
3. WHEN an authenticated user clicks the logout button, THE Auth_Service SHALL invalidate the session and redirect the user to the landing page
4. WHEN an unauthenticated user attempts to access a protected route, THE System SHALL redirect the user to the login page
5. WHILE a user session is active, THE API SHALL validate the JWT on every protected request before processing it

---

### Requirement 3: Public Landing Page

**User Story:** As a visitor, I want to view a public landing page, so that I can understand what Accretio offers and decide whether to sign up.

#### Acceptance Criteria

1. THE UI SHALL display a hero section with a headline, platform description, and CTA buttons for Sign Up and Log In
2. THE UI SHALL display a platform overview section explaining the Hire and Rent engagement models
3. THE UI SHALL display a "How It Works" section describing the steps for both clients and recruiters
4. WHEN a visitor clicks the Sign Up CTA, THE UI SHALL navigate to the sign-up page
5. WHEN a visitor clicks the Log In CTA, THE UI SHALL navigate to the login page

---

### Requirement 4: Public Recruiter Directory

**User Story:** As a visitor or client, I want to browse recruiter profiles without logging in, so that I can evaluate available recruiters before committing to the platform.

#### Acceptance Criteria

1. THE UI SHALL display a publicly accessible recruiter directory page listing all recruiter profiles
2. WHEN the recruiter directory is loading, THE UI SHALL display skeleton loader cards in place of recruiter cards
3. THE UI SHALL display each recruiter as a card showing: profile photo, full name, specialties, and availability badge
4. WHEN a visitor clicks a recruiter card, THE UI SHALL navigate to that recruiter's public profile page
5. WHEN an unauthenticated visitor clicks the "Send Request" button on a recruiter card, THE System SHALL redirect the visitor to the login page
6. THE UI SHALL allow filtering the recruiter directory by specialty, availability status, and experience level without requiring login

---

### Requirement 5: Recruiter Public Profile Page

**User Story:** As a visitor or client, I want to view a recruiter's full public profile, so that I can assess their background and suitability before engaging them.

#### Acceptance Criteria

1. WHEN a user navigates to a recruiter's profile page, THE UI SHALL display the recruiter's full name, photo, bio, specialties, years of experience, industries, and availability status
2. WHEN an authenticated client views a recruiter's public profile, THE UI SHALL display a "Send Request" button
3. WHEN an unauthenticated visitor views a recruiter's public profile, THE UI SHALL display a "Log In to Send Request" prompt in place of the Send Request button

---

### Requirement 6: Client Dashboard — Overview

**User Story:** As a client, I want to see an overview of my activity on the platform, so that I can quickly understand the status of my hiring efforts.

#### Acceptance Criteria

1. WHEN an authenticated client accesses their dashboard, THE UI SHALL display overview cards showing: count of active requisitions, total applications received, and total direct requests sent
2. WHILE dashboard data is loading, THE UI SHALL display skeleton loaders in place of overview cards
3. WHEN a dashboard data fetch fails, THE System SHALL display a toast notification with an error message

---

### Requirement 7: Client Requisition Management

**User Story:** As a client, I want to create and manage requisitions, so that I can attract and evaluate recruiter applications for my hiring needs.

#### Acceptance Criteria

1. WHEN an authenticated client submits a valid requisition form, THE API SHALL create a new requisition record with status "pending" and return a success response
2. WHEN an authenticated client submits a requisition form with missing required fields (Job Title, Engagement Type, Role Description, Person Specification), THE UI SHALL display inline validation errors and prevent submission
3. THE UI SHALL display the client's requisitions as a list with color-coded status badges: Pending = amber, Approved = green, Rejected = red, Closed = gray
4. WHEN a client clicks on a requisition, THE UI SHALL display all recruiter applications for that requisition
5. WHEN a client clicks "Accept" on a recruiter application, THE API SHALL update the application status to "selected" and all other applications for that requisition to "not_selected"
6. WHEN a client clicks "Decline" on a recruiter application, THE API SHALL update the application status to "not_selected"
7. IF a requisition form submission fails, THEN THE System SHALL display a toast notification with an error message and preserve the form data

---

### Requirement 8: Client Browse Recruiters and Direct Requests

**User Story:** As a client, I want to browse recruiters and send direct engagement requests, so that I can proactively reach out to recruiters who match my needs.

#### Acceptance Criteria

1. THE UI SHALL display a filterable recruiter directory within the client dashboard, filterable by specialty, availability, and experience level
2. WHEN a client clicks "Send Request" on a recruiter card, THE UI SHALL open a modal with fields for Engagement Type, Duration, and a short message
3. WHEN a client submits a valid direct request form, THE API SHALL create a new direct_request record with status "pending"
4. WHEN a client submits a direct request form with missing required fields, THE UI SHALL display inline validation errors and prevent submission
5. IF a direct request submission fails, THEN THE System SHALL display a toast notification with an error message

---

### Requirement 9: Recruiter Profile Management

**User Story:** As a recruiter, I want to create and edit my profile, so that clients can discover me and assess my suitability for their needs.

#### Acceptance Criteria

1. WHEN an authenticated recruiter submits a valid profile update form, THE API SHALL update the recruiter_profiles record and return a success response
2. THE UI SHALL display a live profile preview alongside the edit form, reflecting changes in real time as the recruiter edits fields
3. THE UI SHALL support multi-select tag input for the specialties field
4. THE UI SHALL support photo upload for the profile photo field
5. WHEN a recruiter uploads a profile photo, THE System SHALL store the photo and update the photo_url field in the recruiter_profiles table
6. WHEN a profile update succeeds, THE System SHALL display a success toast notification
7. IF a profile update fails, THEN THE System SHALL display an error toast notification

---

### Requirement 10: Recruiter Open Requisitions and Applications

**User Story:** As a recruiter, I want to browse approved requisitions and apply to them, so that I can find and pursue relevant client engagements.

#### Acceptance Criteria

1. WHEN an authenticated recruiter accesses the Open Requisitions tab, THE API SHALL return only requisitions with status "approved"
2. THE UI SHALL allow filtering open requisitions by engagement type, industry, and duration
3. WHEN a recruiter clicks on a requisition, THE UI SHALL display the full requisition details including job title, department, employment type, engagement type, duration, role description, and person specification
4. WHEN a recruiter clicks "Apply", THE UI SHALL open a modal with a cover note text field
5. WHEN a recruiter submits a valid application, THE API SHALL create a new application record with status "submitted"
6. WHEN a recruiter attempts to apply to a requisition they have already applied to, THE System SHALL display an inline message indicating they have already applied
7. THE UI SHALL display the recruiter's submitted applications with color-coded status badges: Submitted = amber, Reviewed = blue, Selected = green, Not Selected = gray

---

### Requirement 11: Recruiter Direct Requests

**User Story:** As a recruiter, I want to view and respond to direct engagement requests from clients, so that I can accept or decline opportunities that come to me.

#### Acceptance Criteria

1. WHEN an authenticated recruiter accesses the Direct Requests tab, THE API SHALL return all direct_request records where recruiter_id matches the authenticated recruiter
2. THE UI SHALL display each direct request showing: client name, engagement type, duration, and message
3. WHEN a recruiter clicks "Accept" on a direct request, THE API SHALL update the direct_request status to "accepted"
4. WHEN a recruiter clicks "Decline" on a direct request, THE API SHALL update the direct_request status to "declined"
5. IF a status update fails, THEN THE System SHALL display an error toast notification

---

### Requirement 12: Admin Requisition Approval

**User Story:** As an admin, I want to review and approve or reject client requisitions, so that only appropriate requisitions are visible to recruiters.

#### Acceptance Criteria

1. WHEN an authenticated admin accesses the Requisitions tab, THE API SHALL return all requisitions regardless of status
2. THE UI SHALL display requisitions in a table with columns: Client Name, Job Title, Engagement Type, Date Submitted, and Status
3. WHEN an admin clicks "Approve" on a requisition, THE API SHALL update the requisition status to "approved"
4. WHEN an admin clicks "Reject" on a requisition, THE UI SHALL require the admin to enter a rejection reason before confirming
5. WHEN an admin submits a rejection with a reason, THE API SHALL update the requisition status to "rejected" and store the rejection_reason
6. IF a requisition status update fails, THEN THE System SHALL display an error toast notification

---

### Requirement 13: Admin User Management

**User Story:** As an admin, I want to view all registered clients and recruiters, so that I can monitor platform usage and manage users.

#### Acceptance Criteria

1. WHEN an authenticated admin accesses the Users tab, THE UI SHALL display separate sub-tabs for Clients and Recruiters
2. THE UI SHALL display each user in a table with columns: Name, Email, Date Joined, and Status
3. WHEN the users table is loading, THE UI SHALL display skeleton loaders

---

### Requirement 14: Empty States

**User Story:** As any authenticated user, I want to see helpful empty states when there is no data, so that I understand what actions to take next.

#### Acceptance Criteria

1. WHEN a dashboard tab has no data to display, THE UI SHALL display an empty state message and a contextual call-to-action
2. THE UI SHALL display distinct empty state messages for each tab (e.g., "No requisitions yet — post your first one" for the client requisitions tab)

---

### Requirement 15: Toast Notifications

**User Story:** As any authenticated user, I want to receive toast notifications for all significant actions, so that I always know whether an action succeeded or failed.

#### Acceptance Criteria

1. WHEN any API mutation (create, update, delete) succeeds, THE System SHALL display a success toast notification
2. WHEN any API mutation fails, THE System SHALL display an error toast notification
3. WHEN any API request is in a pending/loading state, THE System SHALL display a pending toast or loading indicator
4. THE UI SHALL display toast notifications without blocking the main content area

---

### Requirement 16: Responsive Design and UI Standards

**User Story:** As any user, I want the platform to be usable on any device, so that I can access Accretio from desktop, tablet, or mobile.

#### Acceptance Criteria

1. THE UI SHALL be fully responsive across desktop, tablet, and mobile viewport sizes
2. THE UI SHALL use the Inter font family throughout
3. THE UI SHALL apply the defined color palette: Primary #0D1B4B, Accent #00C853, Supporting #00897B, Neutral #F0F4FF
4. THE UI SHALL apply border-radius of 12px–16px to cards, modals, and input elements
5. THE UI SHALL apply smooth hover transitions and micro-animations to buttons, cards, and inputs
6. WHILE any data fetch is in progress, THE UI SHALL display skeleton loaders in place of content
7. THE UI SHALL display the Accretio logo (green triangle "A" mark) in the navigation bar

---

### Requirement 17: API Authorization and Data Isolation

**User Story:** As a platform operator, I want all API endpoints to enforce role-based access control, so that users can only access data they are authorized to see.

#### Acceptance Criteria

1. WHILE processing any request to a protected API endpoint, THE API SHALL validate the JWT and reject requests with missing or invalid tokens with a 401 response
2. WHEN a client attempts to access another client's requisitions or applications, THE API SHALL return a 403 response
3. WHEN a recruiter attempts to access another recruiter's applications or direct requests, THE API SHALL return a 403 response
4. WHEN a non-admin user attempts to access admin-only endpoints, THE API SHALL return a 403 response
5. THE API SHALL enforce row-level data isolation so that each user can only read and write their own records
