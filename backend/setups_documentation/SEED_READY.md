# ✅ seed.py Updated and Ready!

## 📝 What Was Done

The `seed.py` file has been completely updated to populate the Aiven MySQL database with comprehensive test data.

### Data That Will Be Created:

1. **👤 1 Admin User**
   - Username: admin
   - Email: admin@uniattend.com
   - Password: admin123
   - Role: Super Admin

2. **🏫 3 Schools**
   - School of Computing and IT (SCIT)
   - School of Business (SOB)
   - School of Engineering (SOE)

3. **🏢 4 Departments**
   - Computer Science (CS)
   - Information Technology (IT)
   - Business Administration (BA)
   - Civil Engineering (CE)

4. **📚 3 Programs**
   - BSc Computer Science (BSCS) - 4 years
   - BSc Information Technology (BSIT) - 4 years
   - BBA Business Administration (BBA) - 4 years

5. **📖 5 Course Units**
   - CS201: Data Structures and Algorithms
   - CS202: Database Systems
   - IT301: Web Development
   - IT302: Network Security
   - BA101: Financial Accounting

6. **👨‍🏫 5 Lecturers**
   - All with emails: lecturer1@uniattend.com to lecturer5@uniattend.com
   - Password: lecturer123
   - Staff IDs: LEC2025001 to LEC2025005
   - Assigned to various departments
   - With unit assignments

7. **👨‍🎓 30 Students**
   - All with emails: student1@uniattend.com to student30@uniattend.com
   - Password: student123
   - Registration numbers: STU20250001 to STU20250030
   - Distributed across programs (Years 1-4)
   - Enrolled in units (2-3 units each)
   - 15 students have registered devices

8. **🏛️ 5 Venues/Classes**
   - Lecture Hall A (LHA) - 100 capacity
   - Lecture Hall B (LHB) - 150 capacity
   - Computer Lab 1 (CL1) - 40 capacity
   - Tutorial Room 1 (TR1) - 30 capacity
   - Seminar Room (SR1) - 50 capacity

9. **📡 5 BLE Beacons**
   - Each assigned to a venue
   - UUIDs starting with f7826da6-4fa2-4e98-8024-...
   - Battery levels: 85-95%
   - Active status

10. **📅 10+ Timetable Entries**
    - Weekly sessions for all units
    - Monday to Friday
    - 2-3 sessions per unit
    - Mix of lectures and tutorials

11. **📊 10 Attendance Sessions**
    - Linked to timetable entries
    - Ready for tracking attendance
    - With assigned beacons

12. **📱 15 Student Devices**
    - Registered for first 15 students
    - Mix of Android and iOS
    - Ready for BLE attendance

13. **⚙️ 6 System Settings**
    - Attendance threshold: 75%
    - Session duration: 120 minutes
    - Auto-close sessions: true
    - Beacon timeout: 30 seconds
    - Late threshold: 15 minutes
    - Notification email

## ⚠️ CRITICAL: Models.py Required First!

**BEFORE running seed.py, you MUST have a working models.py file!**

The current `models.py` file only contains: `# Models file - Testing`

### What You Need to Do:

1. **Restore models.py** with all 21 model classes:
   - User, Admin, Student, Lecturer
   - School, Department, Program, Unit, ProgramUnit
   - LecturerUnitAssignment, StudentUnitEnrollment
   - Class, Beacon, ClassBeacon
   - TimetableEntry
   - AttendanceSession, AttendanceRecord
   - StudentDevice, BeaconLog
   - SystemSettings, AuditLog

2. **Run the seed script:**
   ```bash
   python seed.py
   ```

3. **Check the output** - You should see:
   - ✓ marks for each data type created
   - Final summary with counts
   - Test credentials displayed

## 🚀 How to Run

```bash
cd backend
python seed.py
```

## 📋 Expected Output

```
🌱 Seeding database...
⚠️  WARNING: This will DELETE all existing data!

🗑️  Clearing existing data...
   ✓ Cleared beacon_logs
   ✓ Cleared attendance_records
   ... (more tables)
   ✅ All tables cleared!

👤 Creating admin user...
   ✓ Admin user created: admin@uniattend.com

🏫 Creating schools...
   ✓ Created 3 schools

... (more sections)

💾 Committing all changes to database...

============================================================
✅ Database seeded successfully!
============================================================

📝 Test Credentials:
------------------------------------------------------------
👤 Admin:
   Email:    admin@uniattend.com
   Password: admin123

👨‍🏫 Lecturer (example):
   Email:    lecturer1@uniattend.com
   Password: lecturer123

👨‍🎓 Student (example):
   Email:    student1@uniattend.com
   Password: student123
------------------------------------------------------------

📊 Data Summary:
------------------------------------------------------------
   🏫 Schools:                    3
   🏢 Departments:                4
   📚 Programs:                   3
   📖 Units:                      5
   🔗 Program-Unit Links:         5
   👨‍🏫 Lecturers:                  5
   📝 Lecturer-Unit Assignments:  5
   👨‍🎓 Students:                   30
   📋 Student-Unit Enrollments:   ~60-90
   📱 Student Devices:            15
   🏛️  Venues/Classes:             5
   📡 Beacons:                    5
   🔗 Class-Beacon Assignments:   5
   📅 Timetable Entries:          10-15
   📊 Attendance Sessions:        10
   ⚙️  System Settings:            6
------------------------------------------------------------

🚀 You can now start the backend server!
   Run: python run.py
============================================================
```

## 🎯 What This Enables

After seeding, you'll have a fully functional database with:

✅ **Admin Portal** - Ready to use with full user management
✅ **User Authentication** - Multiple user types with real credentials
✅ **Academic Structure** - Complete hierarchy (Schools → Departments → Programs → Units)
✅ **People** - Lecturers and students with profiles
✅ **Assignments** - Lecturers assigned to units, students enrolled in units
✅ **Infrastructure** - Venues with BLE beacons assigned
✅ **Scheduling** - Timetable with recurring weekly sessions
✅ **Attendance System** - Sessions ready for tracking attendance
✅ **Devices** - Student devices registered for BLE-based attendance
✅ **Configuration** - System settings configured

## 🔧 Troubleshooting

### If you get import errors:
```
ModuleNotFoundError: No module named 'app.models'
```
**Solution:** The models.py file needs to be restored with all models.

### If you get attribute errors:
```
AttributeError: 'User' object has no attribute 'user_id'
```
**Solution:** The models need to use the correct primary key names (user_id, not id).

### If you get foreign key errors:
```
Cannot add or update a child row: a foreign key constraint fails
```
**Solution:** Check that all foreign key relationships in models.py match the database schema.

## 📌 Next Steps

1. ✅ seed.py is ready
2. ⏳ Restore models.py (required!)
3. ⏳ Run seed.py
4. ⏳ Start backend server
5. ⏳ Test login with admin credentials
6. ⏳ Verify data in database

---

**Status:** seed.py updated and ready to populate database
**Date:** November 11, 2025
**Required:** Complete models.py file before running
