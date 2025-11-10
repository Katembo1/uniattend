# UniAttend API Documentation

Complete REST API documentation for the UniAttend backend.

## Base URL
```
http://localhost:5000/api
```

## Authentication

All endpoints (except login) require JWT authentication.
Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Login
```http
POST /admin/auth/login
```
**Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```
**Response:** `200 OK`
```json
{
  "token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin"
  }
}
```

### Logout
```http
POST /admin/auth/logout
```
**Response:** `200 OK`

### Change Password
```http
POST /admin/auth/change-password
```
**Body:**
```json
{
  "oldPassword": "currentpassword",
  "newPassword": "newpassword123"
}
```
**Response:** `200 OK`

---

## 👥 User Management

### Get All Users
```http
GET /admin/users?page=1&per_page=20&role=student&status=active
```
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)
- `role` (optional): Filter by role (student/lecturer/admin)
- `status` (optional): Filter by status (active/inactive/suspended)

**Response:** `200 OK` (Paginated)

### Get User by ID
```http
GET /admin/users/:id
```

### Create User
```http
POST /admin/users
```
**Body:**
```json
{
  "email": "user@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "student",
  "password": "changeme123"
}
```
**Response:** `201 Created`

### Update User
```http
PUT /admin/users/:id
```
**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "status": "active"
}
```
**Response:** `200 OK`

### Delete User
```http
DELETE /admin/users/:id
```
**Response:** `200 OK`

### Activate User
```http
PUT /admin/users/:id/activate
```

### Deactivate User
```http
PUT /admin/users/:id/deactivate
```

---

## 🎓 Student Management

### Get All Students
```http
GET /admin/students?page=1&per_page=20&program_id=5
```

### Get Student by ID
```http
GET /admin/students/:id
```

### Create Student
```http
POST /admin/students
```
**Body:**
```json
{
  "email": "student@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "studentId": "S2023001",
  "programId": 5,
  "yearOfStudy": 1,
  "password": "changeme123"
}
```

### Update Student
```http
PUT /admin/students/:id
```

### Delete Student
```http
DELETE /admin/students/:id
```

---

## 👨‍🏫 Lecturer Management

### Get All Lecturers
```http
GET /admin/lecturers?page=1&per_page=20&department_id=3
```

### Get Lecturer by ID
```http
GET /admin/lecturers/:id
```

### Create Lecturer
```http
POST /admin/lecturers
```
**Body:**
```json
{
  "email": "lecturer@example.com",
  "firstName": "Dr. Jane",
  "lastName": "Smith",
  "staffId": "L2023001",
  "departmentId": 3,
  "title": "Dr.",
  "password": "changeme123"
}
```

### Update Lecturer
```http
PUT /admin/lecturers/:id
```

### Delete Lecturer
```http
DELETE /admin/lecturers/:id
```

---

## 🔧 Admin Management

### Get All Admins
```http
GET /admin/admins?page=1&per_page=20
```

### Get Admin by ID
```http
GET /admin/admins/:id
```

### Create Admin
```http
POST /admin/admins
```
**Body:**
```json
{
  "email": "admin@example.com",
  "firstName": "Admin",
  "lastName": "User",
  "permissions": {
    "users": ["read", "write"],
    "settings": ["read"]
  },
  "department": "IT",
  "password": "changeme123"
}
```

### Update Admin
```http
PUT /admin/admins/:id
```

### Delete Admin
```http
DELETE /admin/admins/:id
```

---

## 🏛️ Institutional Hierarchy

### Schools

#### Get All Schools
```http
GET /admin/schools
```

#### Get School by ID
```http
GET /admin/schools/:id
```

#### Create School
```http
POST /admin/schools
```
**Body:**
```json
{
  "name": "School of Computing",
  "code": "SOC",
  "description": "School of Computing and IT"
}
```

#### Update School
```http
PUT /admin/schools/:id
```

#### Delete School
```http
DELETE /admin/schools/:id
```

### Departments

#### Get All Departments
```http
GET /admin/departments?school_id=1
```

#### Create Department
```http
POST /admin/departments
```
**Body:**
```json
{
  "name": "Computer Science",
  "code": "CS",
  "schoolId": 1,
  "description": "Computer Science Department"
}
```

### Programs

#### Get All Programs
```http
GET /admin/programs?department_id=1
```

#### Create Program
```http
POST /admin/programs
```
**Body:**
```json
{
  "name": "BSc Computer Science",
  "code": "BSCS",
  "departmentId": 1,
  "durationYears": 4,
  "description": "Bachelor of Science in Computer Science"
}
```

### Units

#### Get All Units
```http
GET /admin/units?department_id=1
```

#### Create Unit
```http
POST /admin/units
```
**Body:**
```json
{
  "name": "Data Structures",
  "code": "CS201",
  "departmentId": 1,
  "credits": 3,
  "description": "Introduction to Data Structures"
}
```

---

## 🏢 Venue/Class Management

### Get All Venues
```http
GET /admin/venues?page=1&per_page=20
```

### Get Venue by ID
```http
GET /admin/venues/:id
```

### Create Venue
```http
POST /admin/venues
```
**Body:**
```json
{
  "name": "Lecture Hall A",
  "code": "LHA",
  "building": "Main Building",
  "floor": "Ground Floor",
  "capacity": 100,
  "type": "lecture_hall",
  "description": "Main lecture hall"
}
```

### Update Venue
```http
PUT /admin/venues/:id
```

### Delete Venue
```http
DELETE /admin/venues/:id
```

---

## 📡 Beacon Management

### Get All Beacons
```http
GET /admin/beacons?page=1&per_page=20&status=active
```

### Get Beacon by ID
```http
GET /admin/beacons/:id
```

### Register Beacon
```http
POST /admin/beacons/register
```
**Body:**
```json
{
  "uuid": "f7826da6-4fa2-4e98-8024-bc5b71e0893e",
  "major": 1,
  "minor": 100,
  "name": "Beacon A1"
}
```

### Update Beacon
```http
PUT /admin/beacons/:id
```
**Body:**
```json
{
  "name": "Updated Name",
  "status": "active",
  "batteryLevel": 85
}
```

### Delete Beacon
```http
DELETE /admin/beacons/:id
```

### Assign Beacon to Venue
```http
POST /admin/beacons/:beacon_id/assign
```
**Body:**
```json
{
  "venueId": 5,
  "isPrimary": true
}
```

### Unassign Beacon from Venue
```http
DELETE /admin/beacons/:beacon_id/unassign/:venue_id
```

---

## 📅 Timetable Management

### Get Timetable Entries
```http
GET /admin/timetable?page=1&per_page=50&unit_id=10&lecturer_id=5&venue_id=3
```

### Get Timetable Entry by ID
```http
GET /admin/timetable/:id
```

### Create Timetable Entry
```http
POST /admin/timetable
```
**Body:**
```json
{
  "unitId": 10,
  "lecturerId": 5,
  "venueId": 3,
  "dayOfWeek": 1,
  "startTime": "09:00:00",
  "endTime": "11:00:00",
  "sessionType": "lecture"
}
```
**Note:** `dayOfWeek`: 0=Monday, 1=Tuesday, ..., 6=Sunday

### Update Timetable Entry
```http
PUT /admin/timetable/:id
```

### Delete Timetable Entry
```http
DELETE /admin/timetable/:id
```

### Bulk Import Timetable
```http
POST /admin/timetable/import
```
**Body:**
```json
{
  "entries": [
    {
      "unitId": 10,
      "lecturerId": 5,
      "venueId": 3,
      "dayOfWeek": 1,
      "startTime": "09:00:00",
      "endTime": "11:00:00",
      "sessionType": "lecture"
    },
    {
      "unitId": 11,
      "lecturerId": 6,
      "venueId": 4,
      "dayOfWeek": 2,
      "startTime": "14:00:00",
      "endTime": "16:00:00",
      "sessionType": "lab"
    }
  ]
}
```

---

## ⚙️ System Settings

### Get All Settings
```http
GET /admin/settings
```
**Response:**
```json
{
  "attendance_threshold": "75",
  "session_duration": "120",
  "auto_close_session": "true"
}
```

### Get Specific Setting
```http
GET /admin/settings/:key
```

### Update Settings
```http
POST /admin/settings
PUT /admin/settings
```
**Body:**
```json
{
  "attendance_threshold": "80",
  "session_duration": "90"
}
```

---

## 📋 Audit Logs

### Get Audit Logs
```http
GET /admin/audit-logs?page=1&per_page=50&user_id=5&action=create&entity_type=student
```

### Get Audit Log by ID
```http
GET /admin/audit-logs/:id
```

### Search Audit Logs
```http
POST /admin/audit-logs/search
```
**Body:**
```json
{
  "page": 1,
  "per_page": 50,
  "user_id": 5,
  "action": "create",
  "entity_type": "student",
  "start_date": "2023-01-01T00:00:00",
  "end_date": "2023-12-31T23:59:59"
}
```

### Get Audit Summary
```http
GET /admin/audit-logs/summary
```
**Response:**
```json
{
  "actionCounts": {
    "create": 150,
    "update": 75,
    "delete": 10,
    "login": 500
  },
  "recentActivity": [...],
  "totalLogs": 735
}
```

---

## 📊 Reports & Analytics

### Get Attendance Statistics
```http
GET /admin/reports/attendance/stats
```
**Response:**
```json
{
  "totalSessions": 150,
  "averageAttendance": 85.5,
  "topAttendingStudents": [...],
  "lowAttendingStudents": [...]
}
```

### Export Attendance Report
```http
POST /admin/reports/attendance/export
```
**Body:**
```json
{
  "start_date": "2023-01-01",
  "end_date": "2023-12-31",
  "format": "csv"
}
```
**Response:**
```json
{
  "message": "Report export queued",
  "downloadUrl": "/downloads/report.csv"
}
```

---

## 📊 Dashboard

### Get Dashboard Statistics
```http
GET /admin/dashboard/stats
```
**Response:**
```json
{
  "totalStudents": 1500,
  "totalLecturers": 75,
  "totalVenues": 50,
  "totalBeacons": 100
}
```

---

## 👤 Profile Management

### Get Current User Profile
```http
GET /admin/profile
```

### Update Current User Profile
```http
PUT /admin/profile
```
**Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "email": "newemail@example.com"
}
```

---

## 🔄 Pagination Response Format

All paginated endpoints return:
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "per_page": 20,
  "pages": 5,
  "has_next": true,
  "has_prev": false
}
```

---

## ❌ Error Response Format

All error responses follow this format:
```json
{
  "message": "Error description"
}
```

### HTTP Status Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Invalid credentials or missing token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## 🔒 Security Notes

1. All endpoints (except login) require JWT authentication
2. Tokens expire after 24 hours (configurable in config.py)
3. Passwords are hashed using Werkzeug's password hashing
4. All actions are logged in the audit log
5. CORS is enabled for specified origins only
6. Use HTTPS in production

---

## 🧪 Testing with cURL

### Login Example
```bash
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Get Users (with token)
```bash
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Student
```bash
curl -X POST http://localhost:5000/api/admin/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"student@example.com",
    "firstName":"John",
    "lastName":"Doe",
    "studentId":"S2023001",
    "programId":5,
    "yearOfStudy":1
  }'
```

---

**Total Endpoints:** 80+
**Lines of Code:** 1483
**Last Updated:** November 2025
