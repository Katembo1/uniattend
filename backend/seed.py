"""
Seed script to populate the database with initial test data
Run this after setting up the database: python seed.py
"""
from app import create_app, db
from app.models import (
    User, Admin, Student, Lecturer,
    School, Department, Program, Unit,
    Class, Beacon, SystemSettings
)
from datetime import datetime

def seed_database():
    app = create_app()
    
    with app.app_context():
        print("🌱 Seeding database...")
        
        # Clear existing data (optional - comment out to keep existing data)
        print("Clearing existing data...")
        db.drop_all()
        db.create_all()
        
        # Create admin user
        print("Creating admin user...")
        admin_user = User(
            email='admin@uniattend.com',
            first_name='Admin',
            last_name='User',
            role='admin',
            status='active'
        )
        admin_user.set_password('admin123')
        db.session.add(admin_user)
        db.session.flush()
        
        admin_profile = Admin(
            user_id=admin_user.id,
            permissions={
                'users': ['read', 'write', 'delete'],
                'settings': ['read', 'write'],
                'reports': ['read', 'export']
            },
            department='Administration'
        )
        db.session.add(admin_profile)
        
        # Create schools
        print("Creating schools...")
        schools = [
            School(name='School of Computing and IT', code='SCIT', 
                   description='School of Computing and Information Technology'),
            School(name='School of Business', code='SOB',
                   description='School of Business and Economics'),
            School(name='School of Engineering', code='SOE',
                   description='School of Engineering')
        ]
        db.session.add_all(schools)
        db.session.flush()
        
        # Create departments
        print("Creating departments...")
        departments = [
            Department(name='Computer Science', code='CS', school_id=schools[0].id),
            Department(name='Information Technology', code='IT', school_id=schools[0].id),
            Department(name='Business Administration', code='BA', school_id=schools[1].id),
            Department(name='Civil Engineering', code='CE', school_id=schools[2].id)
        ]
        db.session.add_all(departments)
        db.session.flush()
        
        # Create programs
        print("Creating programs...")
        programs = [
            Program(name='BSc Computer Science', code='BSCS', 
                   department_id=departments[0].id, duration_years=4),
            Program(name='BSc Information Technology', code='BSIT',
                   department_id=departments[1].id, duration_years=4),
            Program(name='BBA Business Administration', code='BBA',
                   department_id=departments[2].id, duration_years=4)
        ]
        db.session.add_all(programs)
        db.session.flush()
        
        # Create units
        print("Creating units...")
        units = [
            Unit(name='Data Structures', code='CS201', credits=3, department_id=departments[0].id),
            Unit(name='Database Systems', code='CS202', credits=3, department_id=departments[0].id),
            Unit(name='Web Development', code='IT301', credits=3, department_id=departments[1].id),
            Unit(name='Network Security', code='IT302', credits=3, department_id=departments[1].id),
            Unit(name='Financial Accounting', code='BA101', credits=3, department_id=departments[2].id)
        ]
        db.session.add_all(units)
        db.session.flush()
        
        # Create lecturers
        print("Creating lecturers...")
        lecturers = []
        for i in range(1, 6):
            lecturer_user = User(
                email=f'lecturer{i}@uniattend.com',
                first_name=f'Lecturer{i}',
                last_name=f'User{i}',
                role='lecturer',
                status='active'
            )
            lecturer_user.set_password('lecturer123')
            db.session.add(lecturer_user)
            db.session.flush()
            
            lecturer = Lecturer(
                user_id=lecturer_user.id,
                staff_id=f'L202300{i}',
                department_id=departments[i % len(departments)].id,
                title='Dr.' if i % 2 == 0 else 'Prof.'
            )
            db.session.add(lecturer)
            lecturers.append(lecturer)
        
        db.session.flush()
        
        # Create students
        print("Creating students...")
        for i in range(1, 21):
            student_user = User(
                email=f'student{i}@uniattend.com',
                first_name=f'Student{i}',
                last_name=f'User{i}',
                role='student',
                status='active'
            )
            student_user.set_password('student123')
            db.session.add(student_user)
            db.session.flush()
            
            student = Student(
                user_id=student_user.id,
                student_id=f'S2023{str(i).zfill(3)}',
                program_id=programs[i % len(programs)].id,
                year_of_study=(i % 4) + 1
            )
            db.session.add(student)
        
        # Create venues
        print("Creating venues...")
        venues = [
            Class(name='Lecture Hall A', code='LHA', building='Main Building',
                 floor='Ground Floor', capacity=100, type='lecture_hall'),
            Class(name='Lecture Hall B', code='LHB', building='Main Building',
                 floor='1st Floor', capacity=150, type='lecture_hall'),
            Class(name='Computer Lab 1', code='CL1', building='IT Building',
                 floor='2nd Floor', capacity=40, type='lab'),
            Class(name='Tutorial Room 1', code='TR1', building='Academic Block',
                 floor='1st Floor', capacity=30, type='tutorial_room'),
            Class(name='Seminar Room', code='SR1', building='Academic Block',
                 floor='Ground Floor', capacity=50, type='lecture_hall')
        ]
        db.session.add_all(venues)
        db.session.flush()
        
        # Create beacons
        print("Creating beacons...")
        beacons = [
            Beacon(uuid='f7826da6-4fa2-4e98-8024-bc5b71e0893e', major=1, minor=100,
                  name='Beacon A1', status='active', battery_level=95),
            Beacon(uuid='f7826da6-4fa2-4e98-8024-bc5b71e0894e', major=1, minor=101,
                  name='Beacon A2', status='active', battery_level=88),
            Beacon(uuid='f7826da6-4fa2-4e98-8024-bc5b71e0895e', major=1, minor=102,
                  name='Beacon B1', status='active', battery_level=92),
            Beacon(uuid='f7826da6-4fa2-4e98-8024-bc5b71e0896e', major=1, minor=103,
                  name='Beacon B2', status='active', battery_level=85),
            Beacon(uuid='f7826da6-4fa2-4e98-8024-bc5b71e0897e', major=1, minor=104,
                  name='Beacon C1', status='active', battery_level=90)
        ]
        db.session.add_all(beacons)
        db.session.flush()
        
        # Create system settings
        print("Creating system settings...")
        settings = [
            SystemSettings(key='attendance_threshold', value='75',
                         description='Minimum attendance percentage required',
                         data_type='integer'),
            SystemSettings(key='session_duration', value='120',
                         description='Default session duration in minutes',
                         data_type='integer'),
            SystemSettings(key='auto_close_session', value='true',
                         description='Automatically close sessions after duration',
                         data_type='boolean'),
            SystemSettings(key='beacon_timeout', value='30',
                         description='Beacon detection timeout in seconds',
                         data_type='integer'),
            SystemSettings(key='notification_email', value='admin@uniattend.com',
                         description='Email for system notifications',
                         data_type='string')
        ]
        db.session.add_all(settings)
        
        # Commit all changes
        db.session.commit()
        
        print("\n✅ Database seeded successfully!")
        print("\n📝 Test Credentials:")
        print("=" * 50)
        print("Admin:")
        print("  Email: admin@uniattend.com")
        print("  Password: admin123")
        print("\nLecturer (example):")
        print("  Email: lecturer1@uniattend.com")
        print("  Password: lecturer123")
        print("\nStudent (example):")
        print("  Email: student1@uniattend.com")
        print("  Password: student123")
        print("=" * 50)
        print(f"\n📊 Summary:")
        print(f"  - Schools: {len(schools)}")
        print(f"  - Departments: {len(departments)}")
        print(f"  - Programs: {len(programs)}")
        print(f"  - Units: {len(units)}")
        print(f"  - Lecturers: 5")
        print(f"  - Students: 20")
        print(f"  - Venues: {len(venues)}")
        print(f"  - Beacons: {len(beacons)}")
        print(f"  - System Settings: {len(settings)}")
        print()

if __name__ == '__main__':
    seed_database()
