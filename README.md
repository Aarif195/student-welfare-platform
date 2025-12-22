# Student Welfare & Campus Life Platform

## Purpose
This project aims to improve student welfare and campus life by solving real problems such as hostel accommodation, study environment, financial support, and safe campus living.

## Core Module Features
- Student registration and login
- Hostel owner registration and login
- Hostel and room listing management
- Booking system
- Admin approval workflow
- Reviews system
- Public access to search and view hostels

---

## Database Tables

### Students
- id
- full_name
- email
- password
- phone
- profile_image
- created_at
- updated_at

### HostelOwners
- id
- full_name
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
- full_name
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