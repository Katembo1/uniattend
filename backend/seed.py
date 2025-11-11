"""
Seed script to populate the database with initial test data
Run this after setting up the database: python seed.py
"""
import os
from dotenv import load_dotenv

# Use PyMySQL as MySQL driver (required for Aiven connection)
import pymysql
pymysql.install_as_MySQLdb()

# Load environment variables from .env file
load_dotenv()

from app import create_app, db
from datetime import datetime, date, time
import random

def seed_database():
    app = create_app()
    
    with app.app_context():
        # Import models here (after app context is created)
        from app.models import (
            User, Admin, Student, Lecturer,
            School, Department, Program, Unit, ProgramUnit,
            LecturerUnitAssignment, StudentUnitEnrollment,
            Class, Beacon, ClassBeacon, TimetableEntry,
            AttendanceSession, StudentDevice,
            SystemSettings, AuditLog
        )
        
        print("🌱 Seeding database...")
        print("⚠️  WARNING: This will DELETE all existing data!")
        print("📋 Tables that will be populated:")
        print("   - Users, Admins, Students, Lecturers")
        print("   - Schools, Departments, Programs, Units")
        print("   - Classes, Beacons, Timetable Entries")
        print("   - Lecturer-Unit Assignments, Student-Unit Enrollments")
        print("   - Student Devices, Attendance Sessions")
        print("   - System Settings")
        print()
        
        # Clear existing data
        print("🗑️  Clearing existing data...")
        # Delete in reverse order of dependencies
        db.session.execute(db.text('SET FOREIGN_KEY_CHECKS=0'))
        
        tables = [
            'beacon_logs', 'attendance_records', 'attendance_sessions',
            'student_devices', 'student_unit_enrollments', 'lecturer_unit_assignments',
            'timetable_entries', 'class_beacons', 'program_units',
            'beacons', 'classes', 'units', 'programs', 'departments', 'schools',
            'students', 'lecturers', 'admins', 'users',
            'audit_logs', 'system_settings'
        ]
        
        for table in tables:
            try:
                db.session.execute(db.text(f'TRUNCATE TABLE {table}'))
                print(f"   ✓ Cleared {table}")
            except Exception as e:
                print(f"   ⚠ Could not clear {table}: {str(e)}")
        
        db.session.execute(db.text('SET FOREIGN_KEY_CHECKS=1'))
        db.session.commit()
        print("   ✅ All tables cleared!")
        
        
        # Create admin user
        print("\n👤 Creating admin user...")
        admin_user = User(
            username='admin',
            email='admin@uniattend.com',
            user_type='admin',
            is_active=True
        )
        admin_user.set_password('admin123')
        db.session.add(admin_user)
        db.session.flush()
        
        admin_profile = Admin(
            user_id=admin_user.user_id,
            staff_id='ADM001',
            first_name='System',
            middle_name='',
            last_name='Administrator',
            title='Mr',
            admin_role='Super Admin',
            designation='System Administrator',
            phone_number='+254712345678',
            email='admin@uniattend.com',
            office_location='Admin Block, Room 101',
            permissions={
                'users': ['create', 'read', 'update', 'delete'],
                'settings': ['create', 'read', 'update', 'delete'],
                'reports': ['read', 'export'],
                'attendance': ['read', 'update', 'verify']
            },
            is_active=True
        )
        db.session.add(admin_profile)
        print("   ✓ Admin user created: admin@uniattend.com")
        
        
        # Create schools
        print("\n🏫 Creating schools...")
        schools = [
            School(
                school_code='SCIT',
                school_name='School of Computing and IT',
                school_description='School of Computing and Information Technology',
                dean_name='Prof. John Doe',
                contact_email='scit@uniattend.com',
                contact_phone='+254711111111',
                is_active=True
            ),
            School(
                school_code='SOB',
                school_name='School of Business',
                school_description='School of Business and Economics',
                dean_name='Dr. Jane Smith',
                contact_email='sob@uniattend.com',
                contact_phone='+254722222222',
                is_active=True
            ),
            School(
                school_code='SOE',
                school_name='School of Engineering',
                school_description='School of Engineering and Technology',
                dean_name='Prof. Mike Johnson',
                contact_email='soe@uniattend.com',
                contact_phone='+254733333333',
                is_active=True
            )
        ]
        db.session.add_all(schools)
        db.session.flush()
        print(f"   ✓ Created {len(schools)} schools")
        
        
        # Create departments
        print("\n🏢 Creating departments...")
        departments = [
            Department(
                school_id=schools[0].school_id,
                department_code='CS',
                department_name='Computer Science',
                department_description='Department of Computer Science',
                hod_name='Dr. Alice Brown',
                contact_email='cs@uniattend.com',
                contact_phone='+254744444444',
                is_active=True
            ),
            Department(
                school_id=schools[0].school_id,
                department_code='IT',
                department_name='Information Technology',
                department_description='Department of Information Technology',
                hod_name='Dr. Bob Wilson',
                contact_email='it@uniattend.com',
                contact_phone='+254755555555',
                is_active=True
            ),
            Department(
                school_id=schools[1].school_id,
                department_code='BA',
                department_name='Business Administration',
                department_description='Department of Business Administration',
                hod_name='Dr. Carol White',
                contact_email='ba@uniattend.com',
                contact_phone='+254766666666',
                is_active=True
            ),
            Department(
                school_id=schools[2].school_id,
                department_code='CE',
                department_name='Civil Engineering',
                department_description='Department of Civil Engineering',
                hod_name='Dr. David Lee',
                contact_email='ce@uniattend.com',
                contact_phone='+254777777777',
                is_active=True
            )
        ]
        db.session.add_all(departments)
        db.session.flush()
        print(f"   ✓ Created {len(departments)} departments")
        
        
        # Create programs
        print("\n📚 Creating programs...")
        programs = [
            Program(
                department_id=departments[0].department_id,
                program_code='BSCS',
                program_name='BSc Computer Science',
                program_description='Bachelor of Science in Computer Science',
                duration_years=4,
                semesters_per_year=2,
                award_type='Bachelor',
                is_active=True
            ),
            Program(
                department_id=departments[1].department_id,
                program_code='BSIT',
                program_name='BSc Information Technology',
                program_description='Bachelor of Science in Information Technology',
                duration_years=4,
                semesters_per_year=2,
                award_type='Bachelor',
                is_active=True
            ),
            Program(
                department_id=departments[2].department_id,
                program_code='BBA',
                program_name='BBA Business Administration',
                program_description='Bachelor of Business Administration',
                duration_years=4,
                semesters_per_year=2,
                award_type='Bachelor',
                is_active=True
            )
        ]
        db.session.add_all(programs)
        db.session.flush()
        print(f"   ✓ Created {len(programs)} programs")
        
        
        # Create units
        print("\n📖 Creating units...")
        units = [
            Unit(
                unit_code='CS201',
                unit_name='Data Structures and Algorithms',
                unit_description='Introduction to data structures and algorithms',
                credit_hours=3,
                year_of_study=2,
                semester=1,
                program_id=programs[0].program_id,
                is_core=True,
                is_active=True
            ),
            Unit(
                unit_code='CS202',
                unit_name='Database Systems',
                unit_description='Database design and management',
                credit_hours=3,
                year_of_study=2,
                semester=2,
                program_id=programs[0].program_id,
                is_core=True,
                is_active=True
            ),
            Unit(
                unit_code='IT301',
                unit_name='Web Development',
                unit_description='Modern web development technologies',
                credit_hours=4,
                year_of_study=3,
                semester=1,
                program_id=programs[1].program_id,
                is_core=True,
                is_active=True
            ),
            Unit(
                unit_code='IT302',
                unit_name='Network Security',
                unit_description='Computer and network security',
                credit_hours=3,
                year_of_study=3,
                semester=2,
                program_id=programs[1].program_id,
                is_core=True,
                is_active=True
            ),
            Unit(
                unit_code='BA101',
                unit_name='Financial Accounting',
                unit_description='Principles of financial accounting',
                credit_hours=3,
                year_of_study=1,
                semester=1,
                program_id=programs[2].program_id,
                is_core=True,
                is_active=True
            )
        ]
        db.session.add_all(units)
        db.session.flush()
        print(f"   ✓ Created {len(units)} units")
        
        # Create program-unit relationships
        print("\n🔗 Creating program-unit relationships...")
        program_units = []
        for unit in units:
            pu = ProgramUnit(
                program_id=unit.program_id,
                unit_id=unit.unit_id,
                year_of_study=unit.year_of_study,
                semester=unit.semester,
                academic_year=2025,
                is_core=unit.is_core,
                notes=f'Core unit for {unit.unit_name}'
            )
            program_units.append(pu)
        db.session.add_all(program_units)
        print(f"   ✓ Created {len(program_units)} program-unit relationships")
        
        
        # Create lecturers
        print("\n👨‍🏫 Creating lecturers...")
        lecturers = []
        lecturer_data = [
            {'name': 'James', 'dept': 0, 'title': 'Dr', 'status': 'Full-Time'},
            {'name': 'Mary', 'dept': 0, 'title': 'Prof', 'status': 'Full-Time'},
            {'name': 'Peter', 'dept': 1, 'title': 'Dr', 'status': 'Full-Time'},
            {'name': 'Sarah', 'dept': 1, 'title': 'Dr', 'status': 'Part-Time'},
            {'name': 'Michael', 'dept': 2, 'title': 'Prof', 'status': 'Full-Time'}
        ]
        
        for i, ldata in enumerate(lecturer_data, 1):
            lecturer_user = User(
                username=f'lecturer{i}',
                email=f'lecturer{i}@uniattend.com',
                user_type='lecturer',
                is_active=True
            )
            lecturer_user.set_password('lecturer123')
            db.session.add(lecturer_user)
            db.session.flush()
            
            lecturer = Lecturer(
                user_id=lecturer_user.user_id,
                staff_id=f'LEC{2025}{str(i).zfill(3)}',
                first_name=ldata['name'],
                middle_name='K.',
                last_name=f'Lecturer{i}',
                title=ldata['title'],
                department_id=departments[ldata['dept']].department_id,
                designation='Senior Lecturer',
                specialization='Teaching and Research',
                phone_number=f'+25470{str(i).zfill(7)}',
                email=f'lecturer{i}@uniattend.com',
                office_location=f'Block A, Office {100+i}',
                employment_status=ldata['status'],
                is_active=True
            )
            db.session.add(lecturer)
            db.session.flush()
            lecturers.append(lecturer)
        
        print(f"   ✓ Created {len(lecturers)} lecturers")
        
        # Create lecturer-unit assignments
        print("\n📝 Creating lecturer-unit assignments...")
        assignments = []
        for i, unit in enumerate(units):
            lecturer = lecturers[i % len(lecturers)]
            assignment = LecturerUnitAssignment(
                lecturer_id=lecturer.lecturer_id,
                unit_id=unit.unit_id,
                academic_year=2025,
                semester=unit.semester,
                assignment_date=date(2025, 1, 15),
                role='Main Lecturer',
                is_active=True
            )
            assignments.append(assignment)
        db.session.add_all(assignments)
        print(f"   ✓ Created {len(assignments)} lecturer-unit assignments")
        
        
        # Create students
        print("\n👨‍🎓 Creating students...")
        students = []
        for i in range(1, 31):  # 30 students
            student_user = User(
                username=f'student{i}',
                email=f'student{i}@uniattend.com',
                user_type='student',
                is_active=True
            )
            student_user.set_password('student123')
            db.session.add(student_user)
            db.session.flush()
            
            program = programs[i % len(programs)]
            year = ((i - 1) % 4) + 1  # 1-4
            
            student = Student(
                user_id=student_user.user_id,
                registration_number=f'STU{2025}{str(i).zfill(4)}',
                first_name=f'Student{i}',
                middle_name='M.',
                last_name=f'User{i}',
                program_id=program.program_id,
                current_year=year,
                current_semester=1,
                admission_year=2025 - (year - 1),
                date_of_birth=date(2000 + i, (i % 12) + 1, (i % 28) + 1),
                gender='Male' if i % 2 == 0 else 'Female',
                phone_number=f'+25471{str(i).zfill(7)}',
                email=f'student{i}@uniattend.com',
                physical_address=f'{i} Student Street, Nairobi',
                emergency_contact_name=f'Parent{i} User{i}',
                emergency_contact_phone=f'+25472{str(i).zfill(7)}',
                enrollment_status='Active',
                is_active=True
            )
            db.session.add(student)
            db.session.flush()
            students.append(student)
        
        print(f"   ✓ Created {len(students)} students")
        
        # Create student-unit enrollments
        print("\n📋 Creating student-unit enrollments...")
        enrollments = []
        for student in students:
            # Enroll each student in 2-3 units from their program
            program_units_for_student = [u for u in units if u.program_id == student.program_id]
            num_units = min(len(program_units_for_student), random.randint(2, 3))
            
            for unit in random.sample(program_units_for_student, num_units):
                enrollment = StudentUnitEnrollment(
                    student_id=student.student_id,
                    unit_id=unit.unit_id,
                    academic_year=2025,
                    semester=1,
                    enrollment_date=date(2025, 1, 10),
                    enrollment_status='Enrolled',
                    remarks='Regular enrollment'
                )
                enrollments.append(enrollment)
        
        db.session.add_all(enrollments)
        print(f"   ✓ Created {len(enrollments)} student-unit enrollments")
        
        # Create student devices
        print("\n📱 Creating student devices...")
        devices = []
        for i, student in enumerate(students[:15], 1):  # First 15 students have devices
            device = StudentDevice(
                student_id=student.student_id,
                device_mac=f'AA:BB:CC:DD:EE:{str(i).zfill(2)}',
                device_uuid=f'device-uuid-{i}',
                device_name=f'Student{i} Phone',
                is_primary=True,
                is_active=True,
                device_metadata={'os': 'Android' if i % 2 == 0 else 'iOS', 'version': '14.0'}
            )
            devices.append(device)
        
        db.session.add_all(devices)
        print(f"   ✓ Created {len(devices)} student devices")
        
        
        # Create venues/classes
        print("\n🏛️  Creating venues/classes...")
        venues = [
            Class(
                class_code='LHA',
                class_name='Lecture Hall A',
                building='Main Building',
                floor='Ground Floor',
                capacity=100,
                class_type='Lecture Hall',
                has_projector=True,
                has_computers=False,
                location_description='Main building ground floor, near entrance',
                is_active=True
            ),
            Class(
                class_code='LHB',
                class_name='Lecture Hall B',
                building='Main Building',
                floor='1st Floor',
                capacity=150,
                class_type='Lecture Hall',
                has_projector=True,
                has_computers=False,
                location_description='Main building first floor',
                is_active=True
            ),
            Class(
                class_code='CL1',
                class_name='Computer Lab 1',
                building='IT Building',
                floor='2nd Floor',
                capacity=40,
                class_type='Laboratory',
                has_projector=True,
                has_computers=True,
                location_description='IT building computer lab with 40 PCs',
                is_active=True
            ),
            Class(
                class_code='TR1',
                class_name='Tutorial Room 1',
                building='Academic Block',
                floor='1st Floor',
                capacity=30,
                class_type='Tutorial Room',
                has_projector=False,
                has_computers=False,
                location_description='Small tutorial room for group discussions',
                is_active=True
            ),
            Class(
                class_code='SR1',
                class_name='Seminar Room',
                building='Academic Block',
                floor='Ground Floor',
                capacity=50,
                class_type='Seminar Room',
                has_projector=True,
                has_computers=False,
                location_description='Seminar room with presentation facilities',
                is_active=True
            )
        ]
        db.session.add_all(venues)
        db.session.flush()
        print(f"   ✓ Created {len(venues)} venues")
        
        
        # Create beacons
        print("\n📡 Creating beacons...")
        beacons = [
            Beacon(
                beacon_uuid='f7826da6-4fa2-4e98-8024-bc5b71e0893e',
                beacon_name='Beacon LHA-01',
                beacon_major=1,
                beacon_minor=100,
                mac_address='AA:BB:CC:DD:01:00',
                manufacturer='Estimote',
                model='Proximity Beacon',
                firmware_version='1.2.3',
                battery_level=95,
                signal_strength=-60,
                transmission_power=4,
                detection_range_meters=30.00,
                beacon_status='Active',
                installation_date=date(2025, 1, 1),
                notes='Primary beacon for Lecture Hall A',
                is_active=True
            ),
            Beacon(
                beacon_uuid='f7826da6-4fa2-4e98-8024-bc5b71e0894e',
                beacon_name='Beacon LHB-01',
                beacon_major=1,
                beacon_minor=101,
                mac_address='AA:BB:CC:DD:01:01',
                manufacturer='Estimote',
                model='Proximity Beacon',
                firmware_version='1.2.3',
                battery_level=88,
                signal_strength=-58,
                transmission_power=4,
                detection_range_meters=30.00,
                beacon_status='Active',
                installation_date=date(2025, 1, 1),
                notes='Primary beacon for Lecture Hall B',
                is_active=True
            ),
            Beacon(
                beacon_uuid='f7826da6-4fa2-4e98-8024-bc5b71e0895e',
                beacon_name='Beacon CL1-01',
                beacon_major=1,
                beacon_minor=102,
                mac_address='AA:BB:CC:DD:01:02',
                manufacturer='Kontakt.io',
                model='Smart Beacon',
                firmware_version='2.0.1',
                battery_level=92,
                signal_strength=-55,
                transmission_power=4,
                detection_range_meters=25.00,
                beacon_status='Active',
                installation_date=date(2025, 1, 1),
                notes='Primary beacon for Computer Lab 1',
                is_active=True
            ),
            Beacon(
                beacon_uuid='f7826da6-4fa2-4e98-8024-bc5b71e0896e',
                beacon_name='Beacon TR1-01',
                beacon_major=1,
                beacon_minor=103,
                mac_address='AA:BB:CC:DD:01:03',
                manufacturer='Estimote',
                model='Location Beacon',
                firmware_version='1.3.0',
                battery_level=85,
                signal_strength=-62,
                transmission_power=3,
                detection_range_meters=20.00,
                beacon_status='Active',
                installation_date=date(2025, 1, 1),
                notes='Primary beacon for Tutorial Room 1',
                is_active=True
            ),
            Beacon(
                beacon_uuid='f7826da6-4fa2-4e98-8024-bc5b71e0897e',
                beacon_name='Beacon SR1-01',
                beacon_major=1,
                beacon_minor=104,
                mac_address='AA:BB:CC:DD:01:04',
                manufacturer='Kontakt.io',
                model='Smart Beacon',
                firmware_version='2.0.1',
                battery_level=90,
                signal_strength=-59,
                transmission_power=4,
                detection_range_meters=25.00,
                beacon_status='Active',
                installation_date=date(2025, 1, 1),
                notes='Primary beacon for Seminar Room',
                is_active=True
            )
        ]
        db.session.add_all(beacons)
        db.session.flush()
        print(f"   ✓ Created {len(beacons)} beacons")
        
        # Create class-beacon assignments
        print("\n🔗 Creating class-beacon assignments...")
        class_beacons = []
        for i, (venue, beacon) in enumerate(zip(venues, beacons)):
            cb = ClassBeacon(
                class_id=venue.class_id,
                beacon_id=beacon.beacon_id,
                position_description=f'Mounted on front wall of {venue.class_name}',
                installation_date=date(2025, 1, 1),
                is_primary=True,
                is_active=True
            )
            class_beacons.append(cb)
        
        db.session.add_all(class_beacons)
        print(f"   ✓ Created {len(class_beacons)} class-beacon assignments")
        
        # Create timetable entries
        print("\n📅 Creating timetable entries...")
        timetables = []
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        
        for i, unit in enumerate(units):
            # Each unit has 2-3 sessions per week
            num_sessions = 2 if i % 2 == 0 else 3
            assigned_lecturer = lecturers[i % len(lecturers)]
            assigned_venue = venues[i % len(venues)]
            
            for session in range(num_sessions):
                day = days[(i + session) % len(days)]
                hour = 8 + (session * 2)  # 8am, 10am, 12pm, etc.
                
                timetable = TimetableEntry(
                    unit_id=unit.unit_id,
                    lecturer_id=assigned_lecturer.lecturer_id,
                    class_id=assigned_venue.class_id,
                    academic_year=2025,
                    semester=1,
                    day_of_week=day,
                    start_time=time(hour, 0),
                    end_time=time(hour + 2, 0),
                    session_type='Lecture' if session == 0 else 'Tutorial',
                    recurrence_pattern='Weekly',
                    effective_start_date=date(2025, 1, 13),
                    effective_end_date=date(2025, 5, 30),
                    is_active=True
                )
                timetables.append(timetable)
        
        db.session.add_all(timetables)
        db.session.flush()
        print(f"   ✓ Created {len(timetables)} timetable entries")
        
        # Create attendance sessions
        print("\n📊 Creating attendance sessions...")
        sessions = []
        for i, timetable in enumerate(timetables[:10]):  # First 10 timetable entries
            session = AttendanceSession(
                timetable_id=timetable.timetable_id,
                unit_id=timetable.unit_id,
                lecturer_id=timetable.lecturer_id,
                class_id=timetable.class_id,
                beacon_id=beacons[i % len(beacons)].beacon_id,
                session_date=date.today(),
                scheduled_start_time=timetable.start_time,
                scheduled_end_time=timetable.end_time,
                session_status='Scheduled',
                attendance_window_minutes=15,
                total_enrolled=len(students) // 3,  # Approximate enrollments
                total_present=0,
                total_absent=0,
                total_late=0,
                session_notes=f'Session for unit',
                created_by=admin_user.user_id
            )
            sessions.append(session)
        
        db.session.add_all(sessions)
        print(f"   ✓ Created {len(sessions)} attendance sessions")
        
        # Create system settings
        print("\n⚙️  Creating system settings...")
        settings = [
            SystemSettings(
                setting_key='attendance_threshold',
                setting_value='75',
                setting_type='integer',
                setting_category='attendance',
                description='Minimum attendance percentage required',
                is_editable=True
            ),
            SystemSettings(
                setting_key='session_duration',
                setting_value='120',
                setting_type='integer',
                setting_category='attendance',
                description='Default session duration in minutes',
                is_editable=True
            ),
            SystemSettings(
                setting_key='auto_close_session',
                setting_value='true',
                setting_type='boolean',
                setting_category='attendance',
                description='Automatically close sessions after duration',
                is_editable=True
            ),
            SystemSettings(
                setting_key='beacon_timeout',
                setting_value='30',
                setting_type='integer',
                setting_category='beacon',
                description='Beacon detection timeout in seconds',
                is_editable=True
            ),
            SystemSettings(
                setting_key='notification_email',
                setting_value='admin@uniattend.com',
                setting_type='string',
                setting_category='notifications',
                description='Email for system notifications',
                is_editable=True
            ),
            SystemSettings(
                setting_key='late_threshold_minutes',
                setting_value='15',
                setting_type='integer',
                setting_category='attendance',
                description='Minutes after start time to mark as late',
                is_editable=True
            )
        ]
        db.session.add_all(settings)
        print(f"   ✓ Created {len(settings)} system settings")
        
        # Commit all changes
        print("\n💾 Committing all changes to database...")
        db.session.commit()
        
        print("\n" + "="*60)
        print("✅ Database seeded successfully!")
        print("="*60)
        print("\n📝 Test Credentials:")
        print("-" * 60)
        print("👤 Admin:")
        print("   Email:    admin@uniattend.com")
        print("   Password: admin123")
        print("\n👨‍🏫 Lecturer (example):")
        print("   Email:    lecturer1@uniattend.com")
        print("   Password: lecturer123")
        print("\n👨‍🎓 Student (example):")
        print("   Email:    student1@uniattend.com")
        print("   Password: student123")
        print("-" * 60)
        print("\n📊 Data Summary:")
        print("-" * 60)
        print(f"   🏫 Schools:                    {len(schools)}")
        print(f"   🏢 Departments:                {len(departments)}")
        print(f"   📚 Programs:                   {len(programs)}")
        print(f"   📖 Units:                      {len(units)}")
        print(f"   🔗 Program-Unit Links:         {len(program_units)}")
        print(f"   👨‍🏫 Lecturers:                  {len(lecturers)}")
        print(f"   📝 Lecturer-Unit Assignments:  {len(assignments)}")
        print(f"   👨‍🎓 Students:                   {len(students)}")
        print(f"   📋 Student-Unit Enrollments:   {len(enrollments)}")
        print(f"   📱 Student Devices:            {len(devices)}")
        print(f"   🏛️  Venues/Classes:             {len(venues)}")
        print(f"   📡 Beacons:                    {len(beacons)}")
        print(f"   🔗 Class-Beacon Assignments:   {len(class_beacons)}")
        print(f"   📅 Timetable Entries:          {len(timetables)}")
        print(f"   📊 Attendance Sessions:        {len(sessions)}")
        print(f"   ⚙️  System Settings:            {len(settings)}")
        print("-" * 60)
        print("\n🚀 You can now start the backend server!")
        print("   Run: python run.py")
        print("="*60)
        print()

if __name__ == '__main__':
    seed_database()
