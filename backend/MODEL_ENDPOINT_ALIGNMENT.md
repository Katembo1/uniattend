# Model & Endpoint Alignment Analysis

## Executive Summary

**Current Status:** ⚠️ **PARTIALLY ALIGNED** - Admin portal fully implemented, Student and Lecturer portals missing

### What's Implemented ✅
- **Admin Portal**: 100% complete (all models and endpoints)
- **Shared Models**: 9/9 models implemented
- **Authentication**: Admin auth complete, Student/Lecturer auth missing

### What's Missing ❌
- **Student Portal**: 0% (0/6 models, 0/20 endpoints)
- **Lecturer Portal**: 0% (0/5 models, 0/30 endpoints)

---

## Detailed Analysis

### 📊 Shared Models (9 models) - ✅ 100% COMPLETE

| Model | Required | Implemented | Status | File |
|-------|----------|-------------|--------|------|
| BaseModel | ✓ | ✓ | ✅ | models.py:6-20 |
| User | ✓ | ✓ | ✅ | models.py:23-50 |
| School | ✓ | ✓ | ✅ | models.py:95-105 |
| Department | ✓ | ✓ | ✅ | models.py:108-119 |
| Program | ✓ | ✓ | ✅ | models.py:122-133 |
| Unit | ✓ | ✓ | ✅ | models.py:136-147 |
| ProgramUnit | ✓ | ✓ | ✅ | models.py:150-160 |
| Class | ✓ | ✓ | ✅ | models.py:163-174 |
| Beacon | ✓ | ✓ | ✅ | models.py:177-189 |

**Note:** All shared models have proper relationships and inherit from BaseModel with timestamps.

---

## 🔴 STUDENT PORTAL - MISSING ENTIRELY

### Missing Models (6 models)

| # | Model | Purpose | Status |
|---|-------|---------|--------|
| 1 | StudentEnrollment | Unit enrollments | ❌ Not implemented |
| 2 | StudentDevice | Registered BLE devices | ❌ Not implemented |
| 3 | AttendanceRecord | Attendance marking | ❌ Not implemented |
| 4 | AttendanceSession | Active sessions view | ❌ Not implemented |
| 5 | BeaconLog | Beacon detection logs | ❌ Not implemented |
| 6 | Student (extended) | ✅ Exists but missing fields | ⚠️ Basic only |

**Current Student Model:** Has basic fields (student_id, program_id) but missing device relationships.

### Missing Endpoints (20 endpoints)

#### Authentication (4 endpoints) - ❌ 0/4
- ❌ `POST /api/student/auth/login`
- ❌ `POST /api/student/auth/logout`
- ❌ `POST /api/student/auth/change-password`
- ❌ `POST /api/student/auth/forgot-password`

#### Profile (3 endpoints) - ❌ 0/3
- ❌ `GET /api/student/profile`
- ❌ `PUT /api/student/profile`
- ❌ `GET /api/student/profile/statistics`

#### Enrollments (2 endpoints) - ❌ 0/2
- ❌ `GET /api/student/enrollments`
- ❌ `GET /api/student/enrollments/:enrollmentId`

#### Timetable (2 endpoints) - ❌ 0/2
- ❌ `GET /api/student/timetable`
- ❌ `GET /api/student/timetable/upcoming`

#### Attendance (4 endpoints) - ❌ 0/4
- ❌ `GET /api/student/attendance/sessions/active`
- ❌ `POST /api/student/attendance/mark`
- ❌ `GET /api/student/attendance/history`
- ❌ `GET /api/student/attendance/statistics`

#### Devices (4 endpoints) - ❌ 0/4
- ❌ `POST /api/student/devices/register`
- ❌ `GET /api/student/devices`
- ❌ `PUT /api/student/devices/:deviceId/primary`
- ❌ `DELETE /api/student/devices/:deviceId`

---

## 🔴 LECTURER PORTAL - MISSING ENTIRELY

### Missing Models (5 models)

| # | Model | Purpose | Status |
|---|-------|---------|--------|
| 1 | LecturerAssignment | Unit assignments | ❌ Not implemented |
| 2 | TimetableEntry (extended) | ✅ Exists but basic | ⚠️ Needs session fields |
| 3 | AttendanceSessionManagement | Session CRUD | ❌ Not implemented |
| 4 | AttendanceVerification | Verify/correct attendance | ❌ Not implemented |
| 5 | Lecturer (extended) | ✅ Exists but missing fields | ⚠️ Basic only |

**Current Lecturer Model:** Has basic fields (staff_id, department_id) but missing assignment relationships.

### Missing Endpoints (30+ endpoints)

#### Authentication (3 endpoints) - ❌ 0/3
- ❌ `POST /api/lecturer/auth/login`
- ❌ `POST /api/lecturer/auth/logout`
- ❌ `POST /api/lecturer/auth/change-password`

#### Profile (3 endpoints) - ❌ 0/3
- ❌ `GET /api/lecturer/profile`
- ❌ `PUT /api/lecturer/profile`
- ❌ `GET /api/lecturer/statistics`

#### Assignments (3 endpoints) - ❌ 0/3
- ❌ `GET /api/lecturer/assignments`
- ❌ `GET /api/lecturer/assignments/:assignmentId`
- ❌ `GET /api/lecturer/workload`

#### Timetable (3 endpoints) - ❌ 0/3
- ❌ `GET /api/lecturer/timetable`
- ❌ `GET /api/lecturer/timetable/today`
- ❌ `GET /api/lecturer/timetable/upcoming`

#### Session Management (8 endpoints) - ❌ 0/8
- ❌ `POST /api/lecturer/sessions`
- ❌ `PUT /api/lecturer/sessions/:sessionId/start`
- ❌ `PUT /api/lecturer/sessions/:sessionId/end`
- ❌ `PUT /api/lecturer/sessions/:sessionId/cancel`
- ❌ `GET /api/lecturer/sessions/:sessionId`
- ❌ `GET /api/lecturer/sessions/active`
- ❌ `GET /api/lecturer/sessions/today`
- ❌ `GET /api/lecturer/sessions/:sessionId/summary`

#### Attendance Verification (7 endpoints) - ❌ 0/7
- ❌ `PUT /api/lecturer/attendance/:attendanceId/verify`
- ❌ `PUT /api/lecturer/sessions/:sessionId/verify-all`
- ❌ `POST /api/lecturer/attendance/manual`
- ❌ `POST /api/lecturer/attendance/bulk`
- ❌ `GET /api/lecturer/attendance/unverified`
- ❌ `GET /api/lecturer/sessions/:sessionId/suspicious`
- ❌ `GET /api/lecturer/sessions/:sessionId/export`

#### Reports (3 endpoints) - ❌ 0/3
- ❌ `GET /api/lecturer/reports/attendance-stats`
- ❌ `GET /api/lecturer/reports/unit/:unitId`
- ❌ `GET /api/lecturer/reports/student/:studentId`

#### Class Lists (1 endpoint) - ❌ 0/1
- ❌ `GET /api/lecturer/units/:unitId/students`

---

## ✅ ADMIN PORTAL - FULLY IMPLEMENTED

### Models (5 models) - ✅ 100% Complete

| Model | Required | Implemented | Status |
|-------|----------|-------------|--------|
| Admin | ✓ | ✓ | ✅ Complete |
| AuditLog | ✓ | ✓ | ✅ Complete |
| SystemSettings | ✓ | ✓ | ✅ Complete |
| ClassBeacon | ✓ | ✓ | ✅ Complete |
| Report | ✓ | - | ⚠️ Implicit (via queries) |

### Endpoints - ✅ 80+ Implemented

#### Authentication (3) - ✅ 3/3
- ✅ `POST /api/admin/auth/login`
- ✅ `POST /api/admin/auth/logout`
- ✅ `POST /api/admin/auth/change-password`

#### Admin Management (7) - ✅ 7/7
- ✅ `GET /api/admin/admins`
- ✅ `GET /api/admin/admins/:adminId`
- ✅ `POST /api/admin/admins`
- ✅ `PUT /api/admin/admins/:adminId`
- ✅ `DELETE /api/admin/admins/:adminId`
- ✅ `GET /api/admin/admins/role/:role`
- ✅ `PUT /api/admin/admins/:adminId/permissions`

#### User Management (7) - ✅ 7/7
- ✅ `GET /api/admin/users`
- ✅ `GET /api/admin/users/:userId`
- ✅ `POST /api/admin/users`
- ✅ `PUT /api/admin/users/:userId`
- ✅ `DELETE /api/admin/users/:userId`
- ✅ `PUT /api/admin/users/:userId/activate`
- ✅ `PUT /api/admin/users/:userId/deactivate`

#### Student Management (5) - ✅ 5/5
- ✅ `GET /api/admin/students`
- ✅ `GET /api/admin/students/:studentId`
- ✅ `POST /api/admin/students`
- ✅ `PUT /api/admin/students/:studentId`
- ✅ `DELETE /api/admin/students/:studentId`

#### Lecturer Management (5) - ✅ 5/5
- ✅ All CRUD endpoints implemented

#### Institutional Hierarchy (20) - ✅ 20/20
- ✅ Schools: 5/5 endpoints
- ✅ Departments: 5/5 endpoints
- ✅ Programs: 5/5 endpoints
- ✅ Units: 5/5 endpoints

#### Venue/Class Management (5) - ✅ 5/5
- ✅ All CRUD endpoints implemented

#### Beacon Management (7) - ✅ 7/7
- ✅ All endpoints including assign/unassign

#### Timetable Management (6) - ✅ 6/6
- ✅ Including bulk import

#### System Settings (5) - ✅ 5/5
- ✅ All settings endpoints

#### Audit Logs (5) - ✅ 5/5
- ✅ All audit endpoints

#### Reports & Analytics (10) - ✅ 10/10
- ✅ All report endpoints

#### Dashboard (1) - ✅ 1/1
- ✅ `GET /api/admin/dashboard/stats`

---

## 🎯 Recommendations

### Priority 1: Student Portal (HIGH) 🔴

**New Models Required:**
```python
# 1. StudentEnrollment
class StudentEnrollment(BaseModel):
    student_id = ForeignKey(Student)
    unit_id = ForeignKey(Unit)
    program_id = ForeignKey(Program)
    enrollment_date = DateTime
    status = String  # 'active', 'dropped', 'completed'
    grade = String

# 2. StudentDevice
class StudentDevice(BaseModel):
    student_id = ForeignKey(Student)
    device_uuid = String(unique=True)
    device_name = String
    device_type = String  # 'android', 'ios'
    is_primary = Boolean
    last_seen = DateTime
    status = String  # 'active', 'inactive'

# 3. AttendanceRecord
class AttendanceRecord(BaseModel):
    session_id = ForeignKey(AttendanceSession)
    student_id = ForeignKey(Student)
    device_id = ForeignKey(StudentDevice)
    marked_at = DateTime
    verification_status = String  # 'pending', 'verified', 'suspicious'
    latitude = Float
    longitude = Float

# 4. AttendanceSession
class AttendanceSession(BaseModel):
    timetable_entry_id = ForeignKey(TimetableEntry)
    unit_id = ForeignKey(Unit)
    class_id = ForeignKey(Class)
    lecturer_id = ForeignKey(Lecturer)
    session_date = Date
    start_time = Time
    end_time = Time
    actual_start = DateTime
    actual_end = DateTime
    status = String  # 'scheduled', 'active', 'ended', 'cancelled'
    attendance_window = Integer  # minutes

# 5. BeaconLog
class BeaconLog(BaseModel):
    student_id = ForeignKey(Student)
    device_id = ForeignKey(StudentDevice)
    beacon_id = ForeignKey(Beacon)
    detected_at = DateTime
    signal_strength = Integer  # RSSI
    distance_estimate = Float
    latitude = Float
    longitude = Float
```

**20 Endpoints to Implement:**
- Authentication (4)
- Profile (3)
- Enrollments (2)
- Timetable (2)
- Attendance (4)
- Devices (4)

### Priority 2: Lecturer Portal (HIGH) 🔴

**New Models Required:**
```python
# 1. LecturerAssignment
class LecturerAssignment(BaseModel):
    lecturer_id = ForeignKey(Lecturer)
    unit_id = ForeignKey(Unit)
    program_id = ForeignKey(Program)
    semester = String
    academic_year = String
    assignment_type = String  # 'primary', 'assistant'
    status = String  # 'active', 'completed'

# 2. AttendanceVerification (extends AttendanceRecord)
# Add verification fields to AttendanceRecord or create new model
```

**30+ Endpoints to Implement:**
- Authentication (3)
- Profile (3)
- Assignments (3)
- Timetable (3)
- Session Management (8)
- Attendance Verification (7)
- Reports (3)
- Class Lists (1)

### Priority 3: Model Extensions (MEDIUM) 🟡

**Extend TimetableEntry:**
```python
# Add session management fields
session_type = String  # 'lecture', 'tutorial', 'lab'
allow_attendance = Boolean
attendance_window_start = Integer  # minutes before
attendance_window_end = Integer  # minutes after
require_verification = Boolean
```

---

## 📋 Implementation Checklist

### Phase 1: Student Portal
- [ ] Create 5 new models (StudentEnrollment, StudentDevice, AttendanceRecord, AttendanceSession, BeaconLog)
- [ ] Extend Student model with device relationships
- [ ] Implement 20 student endpoints
- [ ] Add student authentication
- [ ] Test student attendance marking workflow

### Phase 2: Lecturer Portal
- [ ] Create 2 new models (LecturerAssignment, AttendanceVerification)
- [ ] Extend TimetableEntry with session fields
- [ ] Implement 30+ lecturer endpoints
- [ ] Add lecturer authentication
- [ ] Test session management workflow

### Phase 3: Integration
- [ ] Test cross-portal workflows
- [ ] Update seed data to include new models
- [ ] Update API documentation
- [ ] Frontend integration for student/lecturer portals

---

## 🔍 Critical Gaps

1. **No Attendance System:** Core functionality missing
   - Students can't mark attendance
   - Lecturers can't manage sessions
   - No attendance records exist

2. **No Device Management:** BLE tracking impossible
   - No student device registration
   - No beacon detection logging
   - Can't track proximity-based attendance

3. **No Portal Separation:** Everyone uses admin routes
   - Students/lecturers authenticate as admin
   - No role-specific endpoints
   - Security concerns

4. **No Session Management:** Real-time tracking missing
   - Can't start/stop attendance sessions
   - No active session tracking
   - No attendance windows

---

## Summary

**Current Implementation:** Admin portal management system
**Missing:** Entire attendance tracking system (Student + Lecturer portals)

The backend is essentially a **user management system** without the core **attendance tracking functionality**. Both student and lecturer portals need to be built from scratch to align with the specification.

**Estimated Work:**
- Student Portal: ~3-5 days (5 models, 20 endpoints)
- Lecturer Portal: ~4-6 days (2 models, 30 endpoints)
- Testing & Integration: ~2-3 days

**Total:** ~2 weeks of development
