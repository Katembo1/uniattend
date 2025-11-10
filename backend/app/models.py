from datetime import datetime, date
from app import db
from werkzeug.security import generate_password_hash, check_password_hash


# ==================== BASE MODEL ====================
class BaseModel(db.Model):
    """Abstract base model with common fields"""
    __abstract__ = True
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        """Convert model to dictionary"""
        result = {}
        for column in self.__table__.columns:
            value = getattr(self, column.name)
            # Convert datetime and date objects to ISO format strings
            if isinstance(value, datetime):
                result[column.name] = value.isoformat()
            elif isinstance(value, date):
                result[column.name] = value.isoformat()
            else:
                result[column.name] = value
        return result


# ==================== USER MODELS ====================
class User(BaseModel):
    """Base user model for authentication"""
    __tablename__ = 'users'
    
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'student', 'lecturer', 'admin'
    status = db.Column(db.String(20), default='active')  # 'active', 'inactive', 'suspended'
    last_login = db.Column(db.DateTime)
    
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
        return data


class Admin(BaseModel):
    """Admin user model"""
    __tablename__ = 'admins'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    permissions = db.Column(db.JSON, default=dict)  # Store permissions as JSON
    department = db.Column(db.String(100))
    
    # Relationships
    user = db.relationship('User', backref='admin_profile', lazy=True)


class Student(BaseModel):
    """Student model"""
    __tablename__ = 'students'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    student_id = db.Column(db.String(20), unique=True, nullable=False, index=True)
    program_id = db.Column(db.Integer, db.ForeignKey('programs.id'))
    year_of_study = db.Column(db.Integer)
    enrollment_date = db.Column(db.Date)
    
    # Relationships
    user = db.relationship('User', backref='student_profile', lazy=True)
    program = db.relationship('Program', backref='students', lazy=True)


class Lecturer(BaseModel):
    """Lecturer model"""
    __tablename__ = 'lecturers'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    staff_id = db.Column(db.String(20), unique=True, nullable=False, index=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))
    title = db.Column(db.String(50))  # 'Dr.', 'Prof.', etc.
    
    # Relationships
    user = db.relationship('User', backref='lecturer_profile', lazy=True)
    department = db.relationship('Department', backref='lecturers', lazy=True)


# ==================== INSTITUTIONAL HIERARCHY ====================
class School(BaseModel):
    """School/Faculty model"""
    __tablename__ = 'schools'
    
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    description = db.Column(db.Text)


class Department(BaseModel):
    """Department model"""
    __tablename__ = 'departments'
    
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    school_id = db.Column(db.Integer, db.ForeignKey('schools.id'), nullable=False)
    description = db.Column(db.Text)
    
    # Relationships
    school = db.relationship('School', backref='departments', lazy=True)


class Program(BaseModel):
    """Academic program/course model"""
    __tablename__ = 'programs'
    
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    duration_years = db.Column(db.Integer)
    description = db.Column(db.Text)
    
    # Relationships
    department = db.relationship('Department', backref='programs', lazy=True)


class Unit(BaseModel):
    """Course unit/module model"""
    __tablename__ = 'units'
    
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False, index=True)
    description = db.Column(db.Text)
    credits = db.Column(db.Integer)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))
    
    # Relationships
    department = db.relationship('Department', backref='units', lazy=True)


class ProgramUnit(BaseModel):
    """Program-Unit relationship (many-to-many)"""
    __tablename__ = 'program_units'
    
    program_id = db.Column(db.Integer, db.ForeignKey('programs.id'), nullable=False)
    unit_id = db.Column(db.Integer, db.ForeignKey('units.id'), nullable=False)
    year_of_study = db.Column(db.Integer)
    semester = db.Column(db.Integer)
    is_mandatory = db.Column(db.Boolean, default=True)
    
    # Relationships
    program = db.relationship('Program', backref='program_units', lazy=True)
    unit = db.relationship('Unit', backref='program_units', lazy=True)


# ==================== VENUE & BEACON ====================
class Class(BaseModel):
    """Classroom/Venue model"""
    __tablename__ = 'classes'
    
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    building = db.Column(db.String(100))
    floor = db.Column(db.String(20))
    capacity = db.Column(db.Integer)
    type = db.Column(db.String(50))  # 'lecture_hall', 'lab', 'tutorial_room'
    description = db.Column(db.Text)


class Beacon(BaseModel):
    """BLE Beacon model"""
    __tablename__ = 'beacons'
    
    uuid = db.Column(db.String(36), unique=True, nullable=False, index=True)
    major = db.Column(db.Integer, nullable=False)
    minor = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(100))
    status = db.Column(db.String(20), default='active')  # 'active', 'inactive', 'maintenance'
    battery_level = db.Column(db.Integer)
    last_seen = db.Column(db.DateTime)


class ClassBeacon(BaseModel):
    """Beacon-Class assignment"""
    __tablename__ = 'class_beacons'
    
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    beacon_id = db.Column(db.Integer, db.ForeignKey('beacons.id'), nullable=False)
    is_primary = db.Column(db.Boolean, default=True)
    assigned_date = db.Column(db.Date, default=datetime.utcnow)
    
    # Relationships
    venue = db.relationship('Class', backref='class_beacons', lazy=True)
    beacon = db.relationship('Beacon', backref='class_beacons', lazy=True)


# ==================== TIMETABLE ====================
class TimetableEntry(BaseModel):
    """Timetable/Schedule model"""
    __tablename__ = 'timetable_entries'
    
    unit_id = db.Column(db.Integer, db.ForeignKey('units.id'), nullable=False)
    lecturer_id = db.Column(db.Integer, db.ForeignKey('lecturers.id'), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    day_of_week = db.Column(db.Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    session_type = db.Column(db.String(50))  # 'lecture', 'lab', 'tutorial'
    
    # Relationships
    unit = db.relationship('Unit', backref='timetable_entries', lazy=True)
    lecturer = db.relationship('Lecturer', backref='timetable_entries', lazy=True)
    venue = db.relationship('Class', backref='timetable_entries', lazy=True)


# ==================== SYSTEM ====================
class SystemSettings(BaseModel):
    """System configuration"""
    __tablename__ = 'system_settings'
    
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.Text)
    description = db.Column(db.Text)
    data_type = db.Column(db.String(20), default='string')  # 'string', 'integer', 'boolean', 'json'


class AuditLog(BaseModel):
    """Audit logging"""
    __tablename__ = 'audit_logs'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    action = db.Column(db.String(50), nullable=False)  # 'create', 'update', 'delete', 'login', etc.
    entity_type = db.Column(db.String(50))  # 'user', 'student', 'timetable', etc.
    entity_id = db.Column(db.Integer)
    details = db.Column(db.JSON)  # Additional details as JSON
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(255))
    
    # Relationships
    user = db.relationship('User', backref='audit_logs', lazy=True)
