from datetime import datetime, date, time
from app import db
from werkzeug.security import generate_password_hash, check_password_hash


# ==================== BASE MODEL ====================
class BaseModel(db.Model):
    """Abstract base model with common fields"""
    __abstract__ = True
    
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        """Convert model to dictionary"""
        result = {}
        for column in self.__table__.columns:
            value = getattr(self, column.name)
            # Convert datetime, date, and time objects to ISO format strings
            if isinstance(value, datetime):
                result[column.name] = value.isoformat()
            elif isinstance(value, date):
                result[column.name] = value.isoformat()
            elif isinstance(value, time):
                result[column.name] = value.strftime('%H:%M:%S')
            else:
                result[column.name] = value
        return result


# ==================== USER MODELS ====================
class User(BaseModel):
    """Base user model for authentication"""
    __tablename__ = 'users'
    
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(100), unique=True, nullable=False, index=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.Enum('admin', 'lecturer', 'student'), nullable=False, index=True)
    is_active = db.Column(db.Boolean, default=True, index=True)
    last_login = db.Column(db.TIMESTAMP)
    password_reset_token = db.Column(db.String(255))
    password_reset_expires = db.Column(db.TIMESTAMP)
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password against hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert to dict without password"""
        data = super().to_dict()
        data.pop('password_hash', None)
        data.pop('password_reset_token', None)
        return data


class Admin(BaseModel):
    """Admin user model"""
    __tablename__ = 'admins'
    
    admin_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False, unique=True)
    staff_id = db.Column(db.String(50), unique=True, nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    middle_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100), nullable=False)
    title = db.Column(db.Enum('Mr', 'Mrs', 'Miss', 'Dr', 'Prof'))
    admin_role = db.Column(db.Enum('Super Admin', 'School Admin', 'Department Admin', 'System Admin'), nullable=False, index=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.department_id'), index=True)
    school_id = db.Column(db.Integer, db.ForeignKey('schools.school_id'), index=True)
    designation = db.Column(db.String(100))
    phone_number = db.Column(db.String(20))
    email = db.Column(db.String(255))
    office_location = db.Column(db.String(100))
    profile_photo_url = db.Column(db.String(500))
    permissions = db.Column(db.JSON)
    is_active = db.Column(db.Boolean, default=True, index=True)
    
    # Relationships
    user = db.relationship('User', backref='admin_profile', lazy=True)
    department = db.relationship('Department', backref='admins', lazy=True, foreign_keys=[department_id])
    school = db.relationship('School', backref='admins', lazy=True)


class Student(BaseModel):
    """Student model"""
    __tablename__ = 'students'
    
    student_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False, unique=True)
    registration_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    first_name = db.Column(db.String(100), nullable=False)
    middle_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100), nullable=False)
    program_id = db.Column(db.Integer, db.ForeignKey('programs.program_id'), index=True)
    current_year = db.Column(db.Integer, index=True)
    current_semester = db.Column(db.Integer)
    admission_year = db.Column(db.Integer)
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.Enum('Male', 'Female', 'Other'))
    phone_number = db.Column(db.String(20))
    alternative_phone = db.Column(db.String(20))
    email = db.Column(db.String(255))
    physical_address = db.Column(db.Text)
    emergency_contact_name = db.Column(db.String(255))
    emergency_contact_phone = db.Column(db.String(20))
    profile_photo_url = db.Column(db.String(500))
    enrollment_status = db.Column(db.Enum('Active', 'Suspended', 'Graduated', 'Deferred', 'Discontinued'), default='Active', index=True)
    is_active = db.Column(db.Boolean, default=True, index=True)
    
    # Relationships
    user = db.relationship('User', backref='student_profile', lazy=True)
    program = db.relationship('Program', backref='students', lazy=True)


class Lecturer(BaseModel):
    """Lecturer model"""
    __tablename__ = 'lecturers'
    
    lecturer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False, unique=True)
    staff_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    first_name = db.Column(db.String(100), nullable=False)
    middle_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100), nullable=False)
    title = db.Column(db.Enum('Mr', 'Mrs', 'Miss', 'Dr', 'Prof'))
    department_id = db.Column(db.Integer, db.ForeignKey('departments.department_id'), index=True)
    designation = db.Column(db.String(100))
    specialization = db.Column(db.Text)
    phone_number = db.Column(db.String(20))
    email = db.Column(db.String(255))
    office_location = db.Column(db.String(100))
    profile_photo_url = db.Column(db.String(500))
    employment_status = db.Column(db.Enum('Full-Time', 'Part-Time', 'Contract', 'Visiting'), default='Full-Time')
    is_active = db.Column(db.Boolean, default=True, index=True)
    
    # Relationships
    user = db.relationship('User', backref='lecturer_profile', lazy=True)
    department = db.relationship('Department', backref='lecturers', lazy=True)


# ==================== INSTITUTIONAL HIERARCHY ====================
class School(BaseModel):
    """School/Faculty model"""
    __tablename__ = 'schools'
    
    school_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    school_code = db.Column(db.String(20), unique=True, nullable=False, index=True)
    school_name = db.Column(db.String(255), nullable=False)
    school_description = db.Column(db.Text)
    dean_name = db.Column(db.String(255))
    contact_email = db.Column(db.String(255))
    contact_phone = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True, index=True)


class Department(BaseModel):
    """Department model"""
    __tablename__ = 'departments'
    
    department_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    school_id = db.Column(db.Integer, db.ForeignKey('schools.school_id'), nullable=False, index=True)
    department_code = db.Column(db.String(20), unique=True, nullable=False, index=True)
    department_name = db.Column(db.String(255), nullable=False)
    department_description = db.Column(db.Text)
    hod_name = db.Column(db.String(255))
    contact_email = db.Column(db.String(255))
    contact_phone = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True, index=True)
    
    # Relationships
    school = db.relationship('School', backref='departments', lazy=True)


class Program(BaseModel):
    """Academic program/course model"""
    __tablename__ = 'programs'
    
    program_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.department_id'), nullable=False, index=True)
    program_code = db.Column(db.String(20), unique=True, nullable=False, index=True)
    program_name = db.Column(db.String(255), nullable=False)
    program_description = db.Column(db.Text)
    duration_years = db.Column(db.Integer)
    semesters_per_year = db.Column(db.Integer, default=2)
    award_type = db.Column(db.Enum('Certificate', 'Diploma', 'Bachelor', 'Master', 'PhD'))
    is_active = db.Column(db.Boolean, default=True, index=True)
    
    # Relationships
    department = db.relationship('Department', backref='programs', lazy=True)


class Unit(BaseModel):
    """Course unit/module model"""
    __tablename__ = 'units'
    
    unit_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    unit_code = db.Column(db.String(20), unique=True, nullable=False, index=True)
    unit_name = db.Column(db.String(255), nullable=False)
    unit_description = db.Column(db.Text)
    credit_hours = db.Column(db.Integer)
    year_of_study = db.Column(db.Integer, index=True)
    semester = db.Column(db.Integer)
    program_id = db.Column(db.Integer, db.ForeignKey('programs.program_id'), index=True)
    is_core = db.Column(db.Boolean, default=True)
    is_active = db.Column(db.Boolean, default=True, index=True)
    
    # Relationships
    program = db.relationship('Program', backref='units', lazy=True)


class ProgramUnit(BaseModel):
    """Program-Unit relationship (many-to-many)"""
    __tablename__ = 'program_units'
    
    program_unit_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    program_id = db.Column(db.Integer, db.ForeignKey('programs.program_id'), nullable=False, index=True)
    unit_id = db.Column(db.Integer, db.ForeignKey('units.unit_id'), nullable=False, index=True)
    year_of_study = db.Column(db.Integer, index=True)
    semester = db.Column(db.Integer)
    academic_year = db.Column(db.Integer)
    is_core = db.Column(db.Boolean, default=True)
    notes = db.Column(db.Text)
    
    # Relationships
    program = db.relationship('Program', backref='program_units', lazy=True)
    unit = db.relationship('Unit', backref='program_units', lazy=True)


class LecturerUnitAssignment(BaseModel):
    """Lecturer-Unit assignment"""
    __tablename__ = 'lecturer_unit_assignments'
    
    assignment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    lecturer_id = db.Column(db.Integer, db.ForeignKey('lecturers.lecturer_id'), nullable=False, index=True)
    unit_id = db.Column(db.Integer, db.ForeignKey('units.unit_id'), nullable=False, index=True)
    academic_year = db.Column(db.Integer, index=True)
    semester = db.Column(db.Integer)
    assignment_date = db.Column(db.Date)
    role = db.Column(db.Enum('Main Lecturer', 'Co-Lecturer', 'Tutorial Assistant'), default='Main Lecturer')
    is_active = db.Column(db.Boolean, default=True, index=True)
    
    # Relationships
    lecturer = db.relationship('Lecturer', backref='unit_assignments', lazy=True)
    unit = db.relationship('Unit', backref='lecturer_assignments', lazy=True)


class StudentUnitEnrollment(BaseModel):
    """Student-Unit enrollment"""
    __tablename__ = 'student_unit_enrollments'
    
    enrollment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False, index=True)
    unit_id = db.Column(db.Integer, db.ForeignKey('units.unit_id'), nullable=False, index=True)
    academic_year = db.Column(db.Integer, index=True)
    semester = db.Column(db.Integer)
    enrollment_date = db.Column(db.Date)
    enrollment_status = db.Column(db.Enum('Enrolled', 'Dropped', 'Completed', 'Failed'), default='Enrolled', index=True)
    final_grade = db.Column(db.String(5))
    remarks = db.Column(db.Text)
    
    # Relationships
    student = db.relationship('Student', backref='unit_enrollments', lazy=True)
    unit = db.relationship('Unit', backref='student_enrollments', lazy=True)


# ==================== VENUE & BEACON ====================
class Class(BaseModel):
    """Classroom/Venue model"""
    __tablename__ = 'classes'
    
    class_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    class_code = db.Column(db.String(20), unique=True, nullable=False, index=True)
    class_name = db.Column(db.String(100), nullable=False)
    building = db.Column(db.String(100), index=True)
    floor = db.Column(db.String(50))
    capacity = db.Column(db.Integer)
    class_type = db.Column(db.Enum('Lecture Hall', 'Laboratory', 'Tutorial Room', 'Seminar Room'))
    has_projector = db.Column(db.Boolean, default=False)
    has_computers = db.Column(db.Boolean, default=False)
    location_description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True, index=True)


class Beacon(BaseModel):
    """BLE Beacon model"""
    __tablename__ = 'beacons'
    
    beacon_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    beacon_uuid = db.Column(db.String(128), unique=True, nullable=False, index=True)
    beacon_name = db.Column(db.String(100))
    beacon_major = db.Column(db.Integer)
    beacon_minor = db.Column(db.Integer)
    mac_address = db.Column(db.String(17), unique=True)
    manufacturer = db.Column(db.String(100))
    model = db.Column(db.String(100))
    firmware_version = db.Column(db.String(50))
    battery_level = db.Column(db.Integer)
    signal_strength = db.Column(db.Integer)
    transmission_power = db.Column(db.Integer)
    detection_range_meters = db.Column(db.Numeric(5, 2))
    beacon_status = db.Column(db.Enum('Active', 'Inactive', 'Maintenance', 'Faulty'), default='Active', index=True)
    last_maintenance_date = db.Column(db.Date)
    installation_date = db.Column(db.Date)
    notes = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True, index=True)


class ClassBeacon(BaseModel):
    """Beacon-Class assignment"""
    __tablename__ = 'class_beacons'
    
    class_beacon_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.class_id'), nullable=False, index=True)
    beacon_id = db.Column(db.Integer, db.ForeignKey('beacons.beacon_id'), nullable=False, index=True)
    position_description = db.Column(db.String(255))
    installation_date = db.Column(db.Date)
    is_primary = db.Column(db.Boolean, default=True)
    is_active = db.Column(db.Boolean, default=True, index=True)
    
    # Relationships
    venue = db.relationship('Class', backref='class_beacons', lazy=True)
    beacon = db.relationship('Beacon', backref='class_beacons', lazy=True)


# ==================== TIMETABLE ====================
class TimetableEntry(BaseModel):
    """Timetable/Schedule model"""
    __tablename__ = 'timetable_entries'
    
    timetable_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    unit_id = db.Column(db.Integer, db.ForeignKey('units.unit_id'), nullable=False, index=True)
    lecturer_id = db.Column(db.Integer, db.ForeignKey('lecturers.lecturer_id'), nullable=False, index=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.class_id'), nullable=False, index=True)
    academic_year = db.Column(db.Integer, index=True)
    semester = db.Column(db.Integer)
    day_of_week = db.Column(db.Enum('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), index=True)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    session_type = db.Column(db.Enum('Lecture', 'Tutorial', 'Practical', 'Seminar'))
    recurrence_pattern = db.Column(db.Enum('Weekly', 'Bi-Weekly', 'Monthly', 'One-Time'), default='Weekly')
    effective_start_date = db.Column(db.Date)
    effective_end_date = db.Column(db.Date)
    is_active = db.Column(db.Boolean, default=True, index=True)
    
    # Relationships
    unit = db.relationship('Unit', backref='timetable_entries', lazy=True)
    lecturer = db.relationship('Lecturer', backref='timetable_entries', lazy=True)
    venue = db.relationship('Class', backref='timetable_entries', lazy=True)


# ==================== ATTENDANCE TRACKING ====================
class AttendanceSession(BaseModel):
    """Attendance session for a class"""
    __tablename__ = 'attendance_sessions'
    
    session_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    timetable_id = db.Column(db.Integer, db.ForeignKey('timetable_entries.timetable_id'), index=True)
    unit_id = db.Column(db.Integer, db.ForeignKey('units.unit_id'), nullable=False, index=True)
    lecturer_id = db.Column(db.Integer, db.ForeignKey('lecturers.lecturer_id'), nullable=False, index=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.class_id'), nullable=False, index=True)
    beacon_id = db.Column(db.Integer, db.ForeignKey('beacons.beacon_id'), index=True)
    session_date = db.Column(db.Date, nullable=False, index=True)
    scheduled_start_time = db.Column(db.Time, nullable=False)
    scheduled_end_time = db.Column(db.Time, nullable=False)
    actual_start_time = db.Column(db.TIMESTAMP)
    actual_end_time = db.Column(db.TIMESTAMP)
    session_status = db.Column(db.Enum('Scheduled', 'Active', 'Completed', 'Cancelled'), default='Scheduled', index=True)
    attendance_window_minutes = db.Column(db.Integer, default=15)
    total_enrolled = db.Column(db.Integer, default=0)
    total_present = db.Column(db.Integer, default=0)
    total_absent = db.Column(db.Integer, default=0)
    total_late = db.Column(db.Integer, default=0)
    attendance_percentage = db.Column(db.Numeric(5, 2))
    session_notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.user_id'), index=True)
    
    # Relationships
    timetable = db.relationship('TimetableEntry', backref='attendance_sessions', lazy=True)
    unit = db.relationship('Unit', backref='attendance_sessions', lazy=True)
    lecturer = db.relationship('Lecturer', backref='attendance_sessions', lazy=True)
    venue = db.relationship('Class', backref='attendance_sessions', lazy=True)
    beacon = db.relationship('Beacon', backref='attendance_sessions', lazy=True)
    creator = db.relationship('User', backref='created_sessions', lazy=True)


class AttendanceRecord(BaseModel):
    """Individual attendance record"""
    __tablename__ = 'attendance_records'
    
    attendance_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    session_id = db.Column(db.Integer, db.ForeignKey('attendance_sessions.session_id'), nullable=False, index=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False, index=True)
    beacon_id = db.Column(db.Integer, db.ForeignKey('beacons.beacon_id'), index=True)
    check_in_time = db.Column(db.TIMESTAMP, default=datetime.utcnow, index=True)
    device_info = db.Column(db.String(255))
    bluetooth_mac = db.Column(db.String(17))
    signal_strength = db.Column(db.Integer)
    gps_latitude = db.Column(db.Numeric(10, 8))
    gps_longitude = db.Column(db.Numeric(11, 8))
    attendance_status = db.Column(db.Enum('Present', 'Late', 'Absent', 'Excused'), default='Present', index=True)
    is_verified = db.Column(db.Boolean, default=False, index=True)
    verification_time = db.Column(db.TIMESTAMP)
    verified_by = db.Column(db.Integer, db.ForeignKey('users.user_id'), index=True)
    remarks = db.Column(db.Text)
    is_valid = db.Column(db.Boolean, default=True)
    
    # Relationships
    session = db.relationship('AttendanceSession', backref='attendance_records', lazy=True)
    student = db.relationship('Student', backref='attendance_records', lazy=True)
    beacon = db.relationship('Beacon', backref='attendance_records', lazy=True)
    verifier = db.relationship('User', backref='verified_attendances', lazy=True)


# ==================== DEVICE MANAGEMENT ====================
class StudentDevice(db.Model):
    """Student device registration"""
    __tablename__ = 'student_devices'
    
    device_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False, index=True)
    device_mac = db.Column(db.String(17), unique=True, nullable=False)
    device_uuid = db.Column(db.String(128), index=True)
    device_name = db.Column(db.String(255))
    registered_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    last_seen = db.Column(db.TIMESTAMP, index=True)
    is_primary = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    device_metadata = db.Column('metadata', db.JSON)
    
    # Relationships
    student = db.relationship('Student', backref='devices', lazy=True)


class BeaconLog(db.Model):
    """Beacon detection logs"""
    __tablename__ = 'beacon_logs'
    
    log_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    beacon_id = db.Column(db.Integer, db.ForeignKey('beacons.beacon_id'), index=True)
    device_mac = db.Column(db.String(17), index=True)
    device_uuid = db.Column(db.String(128))
    rssi = db.Column(db.SmallInteger)
    tx_power = db.Column(db.Integer)
    logged_at = db.Column(db.DateTime, default=datetime.utcnow)
    raw_payload = db.Column(db.JSON)
    session_id = db.Column(db.Integer, db.ForeignKey('attendance_sessions.session_id'), index=True)
    processed = db.Column(db.Boolean, default=False, index=True)
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    
    # Relationships
    beacon = db.relationship('Beacon', backref='beacon_logs', lazy=True)
    session = db.relationship('AttendanceSession', backref='beacon_logs', lazy=True)


# ==================== SYSTEM ====================
class SystemSettings(BaseModel):
    """System configuration"""
    __tablename__ = 'system_settings'
    
    setting_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    setting_key = db.Column(db.String(100), unique=True, nullable=False, index=True)
    setting_value = db.Column(db.Text)
    setting_type = db.Column(db.Enum('string', 'integer', 'boolean', 'json'), default='string')
    setting_category = db.Column(db.String(50), index=True)
    description = db.Column(db.Text)
    is_editable = db.Column(db.Boolean, default=True)


class AuditLog(db.Model):
    """Audit logging"""
    __tablename__ = 'audit_logs'
    
    log_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), index=True)
    user_type = db.Column(db.Enum('admin', 'lecturer', 'student'))
    action_type = db.Column(db.String(100), index=True)
    entity_type = db.Column(db.String(100), index=True)
    entity_id = db.Column(db.Integer)
    action_description = db.Column(db.Text)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.Text)
    request_data = db.Column(db.JSON)
    response_status = db.Column(db.String(20))
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow, index=True)
    
    # Relationships
    user = db.relationship('User', backref='audit_logs', lazy=True)