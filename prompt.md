# FOOD WASTE REDUCTION PLATFORM — PHASE 1

Build a complete full-stack **Food Waste Reduction Platform** using **React.js + Spring Boot + MySQL**.

The main purpose of this application is to connect **food donors** who have surplus food with **NGOs** that can collect and distribute that food.

Phase 1 should focus on the complete core application:

* Authentication
* JWT Security
* Role-based access
* Donor module
* NGO module
* Admin module
* Food donation management
* Donation request workflow
* Dashboard
* Search and filtering
* MySQL database
* REST APIs
* React frontend
* Spring Boot backend
* Validation
* Exception handling
* Swagger documentation

Do NOT implement Phase 2 features yet such as WebSocket, maps, email notifications, analytics charts, ratings, reports, or volunteer module.

---

# 1. TECHNOLOGY STACK

## Frontend

Use:

* React.js
* JavaScript
* HTML5
* CSS3
* Bootstrap
* React Router
* Axios
* React Toastify

## Backend

Use:

* Java 21
* Spring Boot 3.x
* Spring Web
* Spring Data JPA
* Spring Security
* JWT
* Lombok
* Bean Validation
* Maven
* Swagger/OpenAPI

## Database

Use:

* MySQL 8

---

# 2. USER ROLES

The application must have three roles:

### DONOR

Can:

* Register
* Login
* Create food donations
* Edit donations
* Delete donations
* View own donations
* View NGO requests
* Accept requests
* Reject requests
* Track donation status
* View donation history
* Manage profile

### NGO

Can:

* Register
* Login
* View available food
* Search food
* Filter food
* View donation details
* Request food
* Cancel request
* View request history
* View accepted donations
* Mark food as picked up
* Mark donation as completed
* Manage profile

### ADMIN

Can:

* Login
* View users
* View donors
* View NGOs
* Approve NGOs
* Reject NGOs
* Block users
* Unblock users
* View all donations
* View all requests
* Delete inappropriate donations
* Monitor the platform

---

# 3. PROJECT ARCHITECTURE

Create two separate applications:

food-waste-reduction/
│
├── backend/
│
└── frontend/

Backend:

backend/
└── src/main/java/com/foodwaste/
├── controller
├── service
├── service/impl
├── repository
├── entity
├── dto
├── mapper
├── security
├── exception
├── config
└── util

Frontend:

frontend/
└── src/
├── components
├── pages
├── layouts
├── services
├── context
├── routes
├── hooks
├── utils
└── assets

Use a clean layered architecture.

---

# 4. DATABASE

Create MySQL database:

food_waste_reduction

Create these tables:

1. users
2. roles
3. ngos
4. categories
5. donations
6. donation_requests
7. notifications

Notifications table can be created now but advanced real-time notification functionality belongs to Phase 2.

---

# 5. USER TABLE

Create User entity.

Fields:

* id
* fullName
* email
* phone
* password
* address
* city
* role
* enabled
* blocked
* createdAt
* updatedAt

Rules:

* Email must be unique.
* Password must be encrypted using BCrypt.
* blocked should default to false.
* enabled should default to true.

---

# 6. ROLE

Roles:

ROLE_DONOR
ROLE_NGO
ROLE_ADMIN

Use enum or proper role entity.

The role must be stored safely and used by Spring Security.

---

# 7. NGO TABLE

Fields:

* id
* userId
* ngoName
* registrationNumber
* contactPerson
* email
* phone
* address
* city
* description
* approved
* createdAt
* updatedAt

Rules:

* NGO registration requires ADMIN approval.
* An unapproved NGO cannot request food.
* Admin can approve/reject NGO.

---

# 8. CATEGORY TABLE

Fields:

* id
* name
* description
* active

Categories:

* Rice
* Meals
* Bakery
* Fruits
* Vegetables
* Dairy
* Snacks
* Beverages
* Other

Admin should be able to manage categories if required.

---

# 9. DONATION TABLE

Create Donation entity.

Fields:

* id
* foodName
* description
* category
* foodType
* quantity
* quantityUnit
* preparationDate
* expiryDate
* pickupStartTime
* pickupEndTime
* pickupAddress
* city
* imageUrl
* status
* donor
* createdAt
* updatedAt

Food type:

VEGETARIAN
NON_VEGETARIAN

Donation status:

AVAILABLE
REQUESTED
ACCEPTED
PICKED_UP
COMPLETED
EXPIRED
CANCELLED

---

# 10. DONATION REQUEST TABLE

Fields:

* id
* donation
* ngo
* message
* status
* requestedAt
* acceptedAt
* pickedUpAt
* completedAt

Request status:

PENDING
ACCEPTED
REJECTED
CANCELLED
PICKED_UP
COMPLETED

Relationship:

Donation
↓
One-to-Many
↓
DonationRequest

NGO
↓
One-to-Many
↓
DonationRequest

---

# 11. NOTIFICATION TABLE

Fields:

* id
* user
* title
* message
* read
* createdAt

Phase 1 only needs database support.

Full real-time notification functionality will be implemented in Phase 2.

---

# 12. AUTHENTICATION

Implement:

POST /api/auth/register

POST /api/auth/login

POST /api/auth/change-password

POST /api/auth/forgot-password

For Phase 1, implement registration and login completely.

Forgot-password can have the backend structure prepared but email-based reset belongs to Phase 2.

---

# 13. JWT SECURITY

Implement JWT authentication using Spring Security.

Flow:

User Login
↓
Spring Security
↓
Validate Email + Password
↓
Generate JWT
↓
Return JWT to React
↓
React sends JWT with API requests
↓
JWT Filter validates token
↓
Request reaches Controller

Use:

* JwtService
* JwtAuthenticationFilter
* SecurityConfig
* UserDetailsService

Use BCryptPasswordEncoder.

Never store plain-text passwords.

---

# 14. ROLE-BASED AUTHORIZATION

Protect APIs based on role.

### DONOR APIs

Only DONOR can:

* Create donation
* Edit own donation
* Delete own donation
* Accept/reject requests for own donation

### NGO APIs

Only approved NGO can:

* View available donations
* Request donation
* Cancel request
* Pickup donation
* Complete donation

### ADMIN APIs

Only ADMIN can:

* Manage users
* Approve NGOs
* Block users
* Manage donations
* View all requests

Use:

@PreAuthorize

where appropriate.

---

# 15. REGISTRATION

Create separate registration flow.

Common fields:

* Full Name
* Email
* Phone
* Password
* Address
* City
* Role

If role = DONOR:

Create donor account immediately.

If role = NGO:

Create NGO profile with:

approved = false

Admin must approve the NGO.

Prevent duplicate email registration.

---

# 16. LOGIN RESPONSE

Return:

{
"success": true,
"message": "Login successful",
"data": {
"token": "...",
"userId": 1,
"name": "John",
"email": "[john@gmail.com](mailto:john@gmail.com)",
"role": "DONOR"
}
}

---

# 17. DONOR DASHBOARD

Create donor dashboard.

Display:

* Total Donations
* Available Donations
* Requested Donations
* Accepted Donations
* Completed Donations
* Cancelled Donations

Recent donations table:

* Food
* Category
* Quantity
* Expiry
* Status
* Created Date
* Action

Actions:

* View
* Edit
* Delete

---

# 18. CREATE DONATION

Create form:

Food Name
Description
Category
Food Type
Quantity
Quantity Unit
Preparation Date
Expiry Date
Pickup Start Time
Pickup End Time
Pickup Address
City
Food Image

Validation:

* Food name required
* Category required
* Quantity > 0
* Expiry date must be valid
* Pickup time must be valid
* Address required
* City required

After successful creation:

Status = AVAILABLE

Show:

"Food donation created successfully."

---

# 19. DONATION IMAGE

Allow donor to upload an image.

Supported:

* JPG
* JPEG
* PNG

Maximum file size should be configurable.

For Phase 1, image can be stored locally or through a simple file storage mechanism.

Store the resulting image path/URL in:

imageUrl

Cloud storage can be added later.

---

# 20. MY DONATIONS

Create:

/donor/donations

Display all donations created by the logged-in donor.

Features:

* Search
* Filter
* Sort
* Pagination

Columns:

* ID
* Food
* Category
* Quantity
* Expiry
* Status
* Actions

---

# 21. DONATION DETAILS

Create donation details page.

Display:

* Food image
* Food name
* Category
* Description
* Food type
* Quantity
* Preparation date
* Expiry date
* Pickup time
* Pickup address
* City
* Status
* Donor details

If donor owns the donation:

Show:

* Edit
* Delete

---

# 22. NGO DASHBOARD

Create NGO dashboard.

Cards:

* Available Donations
* Pending Requests
* Accepted Donations
* Picked Up
* Completed Donations

Display recent requests.

---

# 23. AVAILABLE FOOD PAGE

Create:

/ngo/donations

Show all donations with:

Status = AVAILABLE

Display:

* Food image
* Food name
* Category
* Quantity
* Food type
* City
* Expiry date
* Pickup time
* Request button

Only approved NGOs can access this page.

---

# 24. SEARCH AND FILTER

NGO can search food donations.

Search:

* Food name
* City

Filter:

* Category
* Food type
* Status

Sort:

* Latest
* Nearest expiry
* Highest quantity

Implement filtering on backend using Spring Data JPA rather than loading all data into React.

---

# 25. REQUEST FOOD

When NGO clicks:

"Request Food"

Open request form:

* Message

Submit.

Backend checks:

1. NGO is authenticated.
2. NGO is approved.
3. Donation exists.
4. Donation is AVAILABLE.
5. Donation has not expired.
6. NGO has not already requested the donation.
7. NGO is not the donor.

Create request:

status = PENDING

Donation status can become:

REQUESTED

---

# 26. DONOR REQUEST MANAGEMENT

Donor should see requests for their donations.

Page:

/donor/requests

Display:

* Food
* NGO
* Message
* Requested Date
* Status

Actions:

Accept
Reject

When donor accepts:

Request:

PENDING → ACCEPTED

Donation:

REQUESTED → ACCEPTED

When donor rejects:

Request:

PENDING → REJECTED

If there are multiple pending requests, implement a business rule so that once one request is accepted, other pending requests are rejected/cancelled appropriately.

---

# 27. NGO REQUEST HISTORY

Create:

/ngo/requests

Tabs:

* Pending
* Accepted
* Rejected
* Cancelled
* Picked Up
* Completed

Display complete request history.

---

# 28. PICKUP WORKFLOW

After donor accepts:

NGO can see:

"Pickup Food"

When NGO confirms pickup:

Request:

ACCEPTED → PICKED_UP

Donation:

ACCEPTED → PICKED_UP

Store:

pickedUpAt

---

# 29. COMPLETE DONATION

After pickup/distribution:

NGO clicks:

"Mark Completed"

Request:

PICKED_UP → COMPLETED

Donation:

PICKED_UP → COMPLETED

Store:

completedAt

Only the NGO assigned to the request can complete it.

---

# 30. DONATION EXPIRY

Implement basic expiry checking.

A donation cannot be requested after expiry.

When retrieving available donations, exclude expired donations.

If expiry date has passed:

AVAILABLE → EXPIRED

A scheduled automatic expiry mechanism can be improved in Phase 2.

---

# 31. ADMIN DASHBOARD

Create:

/admin/dashboard

Display:

* Total Users
* Total Donors
* Total NGOs
* Approved NGOs
* Pending NGOs
* Total Donations
* Available Donations
* Completed Donations
* Expired Donations
* Pending Requests

---

# 32. ADMIN USER MANAGEMENT

Create:

/admin/users

Admin can:

* View users
* Search users
* Filter by role
* View user details
* Block user
* Unblock user

Blocked users:

* Cannot create donations.
* Cannot request donations.
* Cannot perform protected business operations.

---

# 33. ADMIN NGO MANAGEMENT

Create:

/admin/ngos

Tabs:

* Pending
* Approved
* Rejected

Actions:

Approve
Reject

Approval:

approved = true

Only approved NGOs can request food.

---

# 34. ADMIN DONATION MANAGEMENT

Create:

/admin/donations

Admin can:

* View all donations
* Search donations
* Filter status
* Filter category
* View donation details
* Delete inappropriate donation

Admin deletion must be handled carefully and should not break existing donation request records.

---

# 35. ADMIN REQUEST MANAGEMENT

Create:

/admin/requests

Display:

* Request ID
* Food
* Donor
* NGO
* Requested Date
* Status

Admin can monitor but should not unnecessarily change normal workflow states.

---

# 36. REST API STRUCTURE

## Authentication

POST /api/auth/register
POST /api/auth/login
POST /api/auth/change-password

## Donor

GET /api/donors/dashboard

GET /api/donations/my

POST /api/donations

GET /api/donations/{id}

PUT /api/donations/{id}

DELETE /api/donations/{id}

## Donations

GET /api/donations

GET /api/donations/available

## Requests

POST /api/donation-requests

GET /api/donation-requests/my

GET /api/donation-requests/donor

PUT /api/donation-requests/{id}/accept

PUT /api/donation-requests/{id}/reject

PUT /api/donation-requests/{id}/pickup

PUT /api/donation-requests/{id}/complete

## NGO

GET /api/ngos/profile

PUT /api/ngos/profile

## Admin

GET /api/admin/dashboard

GET /api/admin/users

PUT /api/admin/users/{id}/block

PUT /api/admin/users/{id}/unblock

GET /api/admin/ngos

PUT /api/admin/ngos/{id}/approve

PUT /api/admin/ngos/{id}/reject

GET /api/admin/donations

DELETE /api/admin/donations/{id}

GET /api/admin/requests

---

# 37. DTO DESIGN

Create DTOs.

Examples:

RegisterRequest
LoginRequest
LoginResponse
UserResponse
DonationRequest
DonationResponse
DonationRequestCreateDTO
DonationRequestResponse
NGOResponse
DashboardResponse
ChangePasswordRequest

Do not expose entities directly.

---

# 38. EXCEPTION HANDLING

Create:

ResourceNotFoundException
BadRequestException
UnauthorizedException
ForbiddenException
DuplicateResourceException

Create:

GlobalExceptionHandler

Using:

@ControllerAdvice

Return consistent response.

Example:

{
"success": false,
"message": "Donation not found",
"timestamp": "2026-09-29T20:00:00"
}

---

# 39. VALIDATION

Use:

@NotBlank
@NotNull
@Email
@Size
@Positive
@Min

Validate:

* Name
* Email
* Phone
* Password
* Quantity
* Dates
* Address
* City

Return clear validation errors.

---

# 40. REACT ROUTING

Create routes:

/

/about
/how-it-works
/login
/register

/donor/dashboard
/donor/donations
/donor/donations/create
/donor/donations/:id
/donor/requests
/donor/profile

/ngo/dashboard
/ngo/donations
/ngo/donations/:id
/ngo/requests
/ngo/profile

/admin/dashboard
/admin/users
/admin/ngos
/admin/donations
/admin/requests

Create:

ProtectedRoute

RoleProtectedRoute

Users must not access another role's pages.

---

# 41. REACT API SERVICE

Create Axios configuration.

Example structure:

services/
├── api.js
├── authService.js
├── donationService.js
├── requestService.js
├── ngoService.js
└── adminService.js

Create Axios interceptor to attach JWT to protected requests.

Handle:

401
403
404
500

properly.

---

# 42. REACT AUTH CONTEXT

Create:

AuthContext

Store:

* token
* userId
* name
* email
* role
* login status

Functions:

login()
logout()
isAuthenticated()

Use Context API.

---

# 43. UI DESIGN

Create a modern clean design based on:

Food
Environment
Sustainability
Community

Home page:

### Hero

"Turn Surplus Food into Hope"

Subtitle:

"Connect surplus food with people and communities who need it."

Buttons:

Donate Food
Find Food

### How It Works

1. Donate
2. Request
3. Collect
4. Distribute

### Impact

Display basic platform statistics.

### Footer

Include:

* About
* Contact
* Privacy
* Terms

---

# 44. DASHBOARD DESIGN

Use:

* Sidebar
* Navbar
* Cards
* Tables
* Buttons
* Badges
* Forms
* Modals
* Toast notifications

Status badges:

AVAILABLE
REQUESTED
ACCEPTED
PICKED_UP
COMPLETED
EXPIRED
CANCELLED

Make the entire application responsive.

---

# 45. BUSINESS RULES

Implement all of the following:

1. Email must be unique.

2. Password must be encrypted.

3. Only authenticated users can access protected APIs.

4. Only approved NGOs can request food.

5. Blocked users cannot perform business operations.

6. Donor cannot request their own donation.

7. NGO cannot request the same donation twice.

8. Expired donations cannot be requested.

9. Completed donations cannot be edited.

10. Cancelled donations cannot be requested.

11. Only donation owner can accept/reject requests.

12. Only assigned NGO can mark pickup.

13. Only assigned NGO can mark completed.

14. Quantity must be greater than zero.

15. Expiry date must be valid.

16. NGO approval is required before requesting food.

17. Admin-only operations must be protected.

18. Users cannot access another user's private donation data.

---

# 46. SWAGGER

Integrate Swagger/OpenAPI.

Document all APIs.

Swagger must include:

* Endpoint
* HTTP method
* Request parameters
* Request body
* Response
* HTTP status
* JWT authentication

Provide an "Authorize" option for JWT.

---

# 47. DATABASE RELATIONSHIPS

Use proper JPA relationships.

Example:

User
@OneToMany
Donation

Donation
@ManyToOne
User

Donation
@ManyToOne
Category

Donation
@OneToMany
DonationRequest

DonationRequest
@ManyToOne
Donation

DonationRequest
@ManyToOne
NGO/User

NGO
@OneToOne or appropriate relationship
User

Use foreign keys.

Avoid unnecessary bidirectional relationships that can cause JSON serialization problems.

Use DTOs to prevent recursion.

---

# 48. DATABASE INDEXING

Create indexes for frequently searched fields:

users.email
users.role
users.city
donations.status
donations.category_id
donations.city
donations.expiry_date
donation_requests.status

Use unique constraints where required.

---

# 49. PAGINATION

Implement pagination for:

* Donations
* Users
* NGOs
* Requests

Use Spring Data:

Pageable

Frontend should display:

* Current page
* Total pages
* Next
* Previous

Do not fetch thousands of records at once.

---

# 50. TESTING

Create backend tests using:

JUnit
Mockito
Spring Boot Test

Test:

* Registration
* Login
* Duplicate email
* Password encryption
* JWT authentication
* Role authorization
* Donation creation
* Donation update
* Donation deletion
* NGO approval
* Donation request
* Request acceptance
* Request rejection
* Pickup
* Completion
* Expired donation
* Blocked user

Use Postman for manual API testing.

---

# 51. SECURITY REQUIREMENTS

Never hard-code:

* Database password
* JWT secret
* API keys

Use environment variables.

Example:

DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET

Configure CORS correctly for React frontend.

Do not allow unrestricted production CORS.

---

# 52. README

Create a professional README containing:

## Project Name

Food Waste Reduction Platform

## Overview

## Problem Statement

## Solution

## Features

## Technology Stack

## Architecture

## Database Schema

## API Documentation

## Setup Instructions

## Environment Variables

## Screenshots

## Future Enhancements

Future enhancements should mention Phase 2:

* Location-based search
* Maps
* WebSocket notifications
* Email notifications
* Analytics
* Reports
* Ratings
* Volunteer module

---

# 53. PHASE 1 COMPLETION CHECKLIST

The Phase 1 project is complete only when:

[ ] React frontend works

[ ] Spring Boot backend works

[ ] MySQL connection works

[ ] Registration works

[ ] Login works

[ ] JWT works

[ ] Role-based authorization works

[ ] Donor dashboard works

[ ] NGO dashboard works

[ ] Admin dashboard works

[ ] Donor can create donation

[ ] Donor can edit donation

[ ] Donor can delete donation

[ ] NGO can search donations

[ ] NGO can filter donations

[ ] NGO can request donation

[ ] Donor can accept request

[ ] Donor can reject request

[ ] NGO can mark pickup

[ ] NGO can mark completed

[ ] Donation status updates correctly

[ ] NGO approval works

[ ] Admin user management works

[ ] Admin donation management works

[ ] Validation works

[ ] Exception handling works

[ ] Swagger works

[ ] Pagination works

[ ] Responsive UI works

[ ] API testing completed

[ ] README completed

---

# 54. IMPORTANT DEVELOPMENT RULE

Do not implement Phase 2 features in Phase 1.

Phase 2 will be added only after Phase 1 is fully working.

Phase 2 features:

* Location and distance calculation
* Leaflet/OpenStreetMap
* Real-time WebSocket notifications
* Email notifications
* Automatic expiry scheduler
* Food impact calculation
* Analytics charts
* PDF/CSV reports
* Rating and feedback
* Volunteer module

First create a stable Phase 1 application with clean architecture so that these Phase 2 features can be added without major restructuring.
