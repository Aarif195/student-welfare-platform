# Student Welfare & Campus Life Platform

## Purpose
This project aims to improve student welfare and campus life by solving real problems such as hostel accommodation, study environment, and safe campus living.

## Core Module Features

### Core Module One (Hostel Finder & Booking System)
- Student registration and login  
- Hostel owner registration and login  
- Email verification system with OTP and resend     functionality 
- Hostel and room listing management  
- Booking system  
- Admin approval workflow  
- Reviews system  
- Public access to search and view hostels  
- Guest Logging System: Allows students with approved bookings to register visitors by calculating duration-based stay limits. 


### Core Module Two (Campus/Hostel Notifications)
- Global notifications created by superadmin  
- Hostel-specific notifications created by hostel owners  
- Role-based access control (superadmin, owner, student)  
- View global and hostel notifications  
- Delete notifications (superadmin or notification owner)
- Owner Guest Monitoring: Real-time for owners to filter between Active and History guest records based on automated time-expiry logic.

### Core Module Three (Maintenance Management System)
- Request Creation: Students can submit detailed maintenance complaints linked to their hostel.  
- Status Tracking: Real-time updates (Pending, In-Progress, Resolved, Cancelled).  
- Owner Management: Hostel owners can assign staff, add technical notes, and update progress. 
- Automated Notifications: Instant in-app alerts triggered for students upon status changes.  
- Integrated Data View: Notifications linked directly to request details via SQL Joins for a seamless user experience.
- Read Receipts: Logic to track and update notification read status.

### Core Module 4: Study Space Availability

This module allows students to view available study spaces across campus while enabling the superadmin to manage these spaces centrally.

- Create study space (superadmin only)
- Update study space details (superadmin only)
- Delete study space (superadmin only)
- Get all study spaces (public / authenticated access)
- Get study spaces by status and availability

This module integrates seamlessly with the existing role-based architecture and extends the platform beyond accommodation into academic support infrastructure.

---

## Database Tables

### Students
- id
- firstName
- lastName
- email
- password
- phone
- profile_image
- created_at
- updated_at

### HostelOwners
- id
- firstName
- lastName
- email
- password
- phone
- profile_image
- created_at
- updated_at

### Hostels
- id
- owner_id (FK)
- name
- location
- description
- status
- created_at
- updated_at

### Rooms
- id
- hostel_id (FK)
- room_number
- type
- price
- availability
- images
- created_at
- updated_at

### Bookings
- id
- student_id (FK)
- room_id (FK)
- booking_status
- booked_at
- start_date
- end_date
- total_price

### Reviews
- id
- student_id (FK)
- hostel_id (FK)
- rating
- comment
- created_at

### Admins
- id
- firstName
- lastName
- email
- password
- role
- created_at
- updated_at

---

## API Endpoints

### 1. Student APIs
| Endpoint | Method | Description |
|--------|--------|-------------|
| /students/register | POST | Register a new student |
| /students/login | POST | Login student |
| /students/profile | GET | Get student profile |
| /students/profile | PUT | Update student profile |
| /students/bookings | GET | List all bookings for the student |
| /students/bookings | POST | Book a room |
| /students/bookings/:id | DELETE | Cancel a booking |
| /students/reviews | POST | Leave a review for a hostel |
| /students/reviews/:hostelId | GET | Get reviews for a hostel |

### 2. Hostel Owner APIs
| Endpoint | Method | Description |
|--------|--------|-------------|
| /owners/register | POST | Register a new hostel owner |
| /owners/login | POST | Login owner |
| /owners/profile | GET | Get owner profile |
| /owners/profile | PUT | Update owner profile |
| /owners/hostels | GET | List all hostels owned |
| /owners/hostels | POST | Add new hostel |
| /owners/hostels/:id | PUT | Update hostel info |
| /owners/hostels/:id | DELETE | Remove hostel |
| /owners/hostels/:hostelId/rooms | POST | Add rooms to hostel |
| /owners/hostels


 ### 3. Admin APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| /admin/login | POST | Admin login |
| /admin/hostels/pending | GET | List pending hostels for approval |
| /admin/hostels/:id/approve | PUT | Approve hostel listing |
| /admin/hostels/:id/reject | PUT | Reject hostel listing |
| /admin/users | GET | List all students and owners |
| /admin/users/:id | DELETE | Delete a user |
| /admin/reviews | GET | View all reviews |
| /admin/reviews/:id | DELETE | Remove inappropriate review |


 ### 4. Public Endpoints
 | Endpoint | Method | Description |
 |----------|--------|-------------|
 | /hostels | GET | List all approved hostels |
 | /hostels/:id | GET | Get hostel details including rooms |
 | /hostels/search | GET | Search/filter hostels by location, price, room type |


 student-welfare-platform/
│
├─ src/
│ ├─ controllers/
│ ├─ models/
│ ├─ routes/
│ ├─ middlewares/
│ ├─ utils/
│ └─ index.ts
│
├─ .env
├─ package.json
├─ tsconfig.json
└─ README.md