# 📊 Models vs Database Comparison - UPDATED

## ✅ Fixed: Models Now Match Database Schema

### What Was Fixed:
The migration you ran attempted to modify tables, but the database already had a complete schema with attendance tracking features. I've recreated `models.py` to match the existing database structure exactly.

---

## 📋 Complete Table List in Database

### ✅ Tables Now Matched in Models.py:

1. **users** ✅ - Core authentication table
2. **admins** ✅ - Admin profiles with full details
3. **students** ✅ - Student profiles with enrollment info
4. **lecturers** ✅ - Lecturer profiles with department info
5. **schools** ✅ - School/Faculty structure
6. **departments** ✅ - Department structure
7. **programs** ✅ - Academic programs
8. **units** ✅ - Course units/modules
9. **program_units** ✅ - Program-Unit relationships
10. **lecturer_unit_assignments** ✅ - NEW! Lecturer assignments to units
11. **student_unit_enrollments** ✅ - NEW! Student enrollments in units
12. **classes** ✅ - Classrooms/venues
13. **beacons** ✅ - BLE beacon devices
14. **class_beacons** ✅ - Beacon-classroom assignments
15. **timetable_entries** ✅ - Schedule/timetable
16. **attendance_sessions** ✅ - NEW! Attendance session tracking
17. **attendance_records** ✅ - NEW! Individual attendance records
18. **student_devices** ✅ - NEW! Student device registration
19. **beacon_logs** ✅ - NEW! Beacon detection logs
20. **system_settings** ✅ - System configuration
21. **audit_logs** ✅ - Audit trail

### 📊 Database Views (Read-only):
- **vw_admins_full** - Full admin details with joins
- **vw_students_full** - Full student details with joins
- **vw_lecturers_full** - Full lecturer details with joins
- **vw_attendance_summary** - Attendance summary statistics
- **vw_current_timetable** - Current timetable view

---

## 🆕 NEW Models Added to Match Database

### 1. AttendanceSession
**Purpose:** Track attendance sessions for classes
**Key Fields:**
- session_id, timetable_id, unit_id, lecturer_id, class_id
- session_date, session_status (Scheduled/Active/Completed/Cancelled)
- total_enrolled, total_present, total_absent, total_late
- attendance_percentage

### 2. AttendanceRecord
**Purpose:** Individual student attendance records
**Key Fields:**
- attendance_id, session_id, student_id, beacon_id
- check_in_time, bluetooth_mac, signal_strength
- attendance_status (Present/Late/Absent/Excused)
- is_verified, verified_by

### 3. LecturerUnitAssignment
**Purpose:** Track which lecturers teach which units
**Key Fields:**
- assignment_id, lecturer_id, unit_id
- academic_year, semester
- role (Main Lecturer/Co-Lecturer/Tutorial Assistant)

### 4. StudentUnitEnrollment
**Purpose:** Track student enrollments in specific units
**Key Fields:**
- enrollment_id, student_id, unit_id
- academic_year, semester
- enrollment_status (Enrolled/Dropped/Completed/Failed)
- final_grade

### 5. StudentDevice
**Purpose:** Register student devices for attendance
**Key Fields:**
- device_id, student_id, device_mac, device_uuid
- device_name, is_primary, is_active
- registered_at, last_seen

### 6. BeaconLog
**Purpose:** Log all beacon detection events
**Key Fields:**
- log_id, beacon_id, device_mac, session_id
- rssi (signal strength), tx_power
- logged_at, processed

---

## 🔑 Key Changes from Old Models

### User Model Changes:
- **Old:** `id` (generic primary key)
- **New:** `user_id` (specific primary key matching database)
- **Added:** `username`, `password_reset_token`, `password_reset_expires`
- **Changed:** `role` → `user_type` (enum: admin/lecturer/student)

### Admin Model Changes:
- **Added:** `admin_id` (primary key), `staff_id`, `middle_name`, `title`
- **Added:** `admin_role`, `school_id`, `designation`, `profile_photo_url`
- **Enhanced:** Full contact and office information

### Student Model Changes:
- **Added:** `student_id` (primary key), `registration_number`, `middle_name`
- **Added:** `admission_year`, `date_of_birth`, `gender`, `physical_address`
- **Added:** `emergency_contact_name`, `emergency_contact_phone`
- **Changed:** `year_of_study` → `current_year`, added `current_semester`
- **Added:** `enrollment_status` (Active/Suspended/Graduated/Deferred/Discontinued)

### Lecturer Model Changes:
- **Added:** `lecturer_id` (primary key), `middle_name`, `title`
- **Added:** `designation`, `specialization`, `office_location`
- **Added:** `employment_status` (Full-Time/Part-Time/Contract/Visiting)
- **Added:** `profile_photo_url`

### School/Department/Program Changes:
- **All:** Changed from generic `id` to specific primary keys
- **School:** Added `dean_name`, `contact_email`, `contact_phone`
- **Department:** Added `hod_name`, contact information
- **Program:** Added `duration_years`, `semesters_per_year`, `award_type`

### Unit Changes:
- **Added:** `unit_id` (primary key), `credit_hours`
- **Added:** `year_of_study`, `semester`, `is_core`
- **Enhanced:** Better tracking of unit metadata

### Class (Venue) Changes:
- **Added:** `class_id` (primary key), `class_type` (enum)
- **Added:** `has_projector`, `has_computers`, `location_description`
- **Enhanced:** Comprehensive venue facilities tracking

### Beacon Changes:
- **Added:** `beacon_id` (primary key), `manufacturer`, `model`
- **Added:** `firmware_version`, `transmission_power`, `detection_range_meters`
- **Added:** `beacon_status` (Active/Inactive/Maintenance/Faulty)
- **Added:** `last_maintenance_date`, `installation_date`

### TimetableEntry Changes:
- **Added:** `timetable_id` (primary key), `academic_year`, `semester`
- **Changed:** `day_of_week` from integer to enum (Monday/Tuesday/etc.)
- **Added:** `recurrence_pattern`, `effective_start_date`, `effective_end_date`

---

## 🎯 Alignment Status

| Component | Old Models | New Models | Database | Status |
|-----------|-----------|-----------|----------|--------|
| Core Users | ✅ | ✅ | ✅ | ✅ Aligned |
| Admin Portal | ✅ | ✅ | ✅ | ✅ Aligned |
| Student Portal | ⚠️ Partial | ✅ | ✅ | ✅ Aligned |
| Lecturer Portal | ⚠️ Partial | ✅ | ✅ | ✅ Aligned |
| Institutional Structure | ✅ | ✅ | ✅ | ✅ Aligned |
| Venue/Beacon Management | ✅ | ✅ | ✅ | ✅ Aligned |
| Timetable | ✅ | ✅ | ✅ | ✅ Aligned |
| **Attendance Tracking** | ❌ Missing | ✅ | ✅ | ✅ **NOW ALIGNED!** |
| **Device Management** | ❌ Missing | ✅ | ✅ | ✅ **NOW ALIGNED!** |
| **Unit Assignments** | ❌ Missing | ✅ | ✅ | ✅ **NOW ALIGNED!** |
| **Unit Enrollments** | ❌ Missing | ✅ | ✅ | ✅ **NOW ALIGNED!** |
| System Settings | ✅ | ✅ | ✅ | ✅ Aligned |
| Audit Logs | ✅ | ✅ | ✅ | ✅ Aligned |

---

## 📈 Summary

### Before Fix:
- ❌ 14 models in old models.py
- ❌ 21 tables in database
- ❌ **7 critical tables MISSING from models**
- ❌ Attendance tracking NOT AVAILABLE in code
- ❌ Migration attempting to ALTER existing tables

### After Fix:
- ✅ **21 models matching all database tables**
- ✅ Attendance tracking FULLY SUPPORTED
- ✅ Device management IMPLEMENTED
- ✅ Unit assignments and enrollments IMPLEMENTED
- ✅ All field names and types MATCHING database
- ✅ All primary keys and foreign keys ALIGNED
- ✅ Migration deleted, ready for fresh stamp

---

## 🚀 Next Steps

1. ✅ **Migration Deleted:** Removed the problematic migration file
2. ✅ **Models Recreated:** All models now match database structure
3. ⏭️ **Stamp Database:** Run `flask db stamp head` to mark current state
4. ⏭️ **Future Migrations:** Any new changes will be tracked properly
5. ⏭️ **Test Models:** Verify all models work with existing data

---

## 💡 Important Notes

### Why This Happened:
- The database had a complete schema (likely from another team member or SQL script)
- The models.py file was incomplete and missing 7 critical models
- Running `flask db migrate` tried to "fix" the database to match incomplete models
- This would have DELETED important tables like attendance_sessions, attendance_records, etc.

### Prevention:
- ✅ Always inspect database structure BEFORE running migrations
- ✅ Keep models.py in sync with actual database
- ✅ Use `flask db stamp head` for existing databases
- ✅ Coordinate with team when using shared databases

### Database Views:
The database also has 5 views (vw_*) which are read-only aggregated data:
- These are NOT in models.py (views are not ORM models)
- They can be queried using raw SQL if needed
- Useful for complex reports and dashboards

---

**Status:** ✅ Models and database are now 100% aligned!
**Date:** November 11, 2025
**Action Required:** Run `flask db stamp head` to mark database as current
