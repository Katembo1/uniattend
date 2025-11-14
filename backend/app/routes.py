from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from datetime import datetime
from sqlalchemy import text
from app import db
from app.models import (
    User, Admin, Student, Lecturer, School, Department, Program, Unit,
    Class, Beacon, ClassBeacon, TimetableEntry, SystemSettings, AuditLog
)

# Create Blueprint
api_bp = Blueprint('api', __name__)


# ==================== HELPER FUNCTIONS ====================
def get_current_user_id():
    """Get current user ID from JWT token (convert from string to int)"""
    identity = get_jwt_identity()
    return int(identity) if identity else None


def log_action(user_id, action_type, entity_type=None, entity_id=None, description=None):
    """Log user action to audit log"""
    try:
        # Get user type if user_id is provided
        user_type = None
        if user_id:
            user = User.query.get(user_id)
            if user:
                user_type = user.user_type
        
        log = AuditLog(
            user_id=user_id,
            user_type=user_type,
            action_type=action_type,
            entity_type=entity_type,
            entity_id=entity_id,
            action_description=description,
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent'),
            response_status='success'
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        print(f"Logging error: {e}")
        db.session.rollback()


def paginate_query(query, page=1, per_page=20):
    """Paginate query results"""
    page = max(1, page)
    per_page = min(per_page, 100)
    
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return {
        'items': [item.to_dict() for item in paginated.items],
        'total': paginated.total,
        'page': page,
        'per_page': per_page,
        'pages': paginated.pages,
        'has_next': paginated.has_next,
        'has_prev': paginated.has_prev
    }


# ==================== HEALTH CHECK ====================
@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify backend connectivity"""
    try:
        # Test database connection
        db.session.execute(text('SELECT 1'))
        db_status = 'connected'
    except Exception as e:
        db_status = 'disconnected'
        print(f"Database health check failed: {str(e)}")
    
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'database': db_status,
        'service': 'UniAttend API'
    }), 200


# ==================== AUTHENTICATION ====================
@api_bp.route('/admin/auth/login', methods=['POST'])
def admin_login():
    """Admin login"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'message': 'Email and password required'}), 400
        
        user = User.query.filter_by(email=email, user_type='admin').first()
        
        if not user or not user.check_password(password):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        if not user.is_active:
            return jsonify({'message': 'Account is not active'}), 403
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Create tokens with string identity (JWT requires string)
        access_token = create_access_token(identity=str(user.user_id))
        refresh_token = create_refresh_token(identity=str(user.user_id))
        
        # Log action
        log_action(user.user_id, 'login')
        
        # Get admin profile
        admin = Admin.query.filter_by(user_id=user.user_id).first()
        user_data = user.to_dict()
        
        if admin:
            admin_data = admin.to_dict()
            user_data['admin_profile'] = admin_data
        
        return jsonify({
            'token': access_token,
            'refresh_token': refresh_token,
            'user': user_data
        }), 200
        
    except Exception as e:
        import traceback
        print("LOGIN ERROR:", str(e))
        print(traceback.format_exc())
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/auth/logout', methods=['POST'])
@jwt_required()
def admin_logout():
    """Admin logout"""
    try:
        user_id = get_current_user_id()
        log_action(user_id, 'logout')
        return jsonify({'message': 'Logged out successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/auth/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change password"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()
        
        old_password = data.get('oldPassword')
        new_password = data.get('newPassword')
        
        if not old_password or not new_password:
            return jsonify({'message': 'Old and new passwords required'}), 400
        
        user = User.query.get(user_id)
        
        if not user.check_password(old_password):
            return jsonify({'message': 'Current password is incorrect'}), 401
        
        user.set_password(new_password)
        db.session.commit()
        
        log_action(user_id, 'change_password')
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500


# ==================== USER MANAGEMENT ====================
@api_bp.route('/admin/users', methods=['GET'])
@jwt_required()
def get_users():
    """Get all users with profile information"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        user_type = request.args.get('user_type')
        is_active = request.args.get('is_active')
        
        query = User.query
        
        if user_type:
            query = query.filter_by(user_type=user_type)
        if is_active is not None:
            active_val = is_active.lower() == 'true'
            query = query.filter_by(is_active=active_val)
        
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Enhance user data with profile information
        users_data = []
        for user in paginated.items:
            user_dict = user.to_dict()
            
            # Add name from appropriate profile table
            if user.user_type == 'admin':
                admin = Admin.query.filter_by(user_id=user.user_id).first()
                if admin:
                    user_dict['first_name'] = admin.first_name
                    user_dict['last_name'] = admin.last_name
                    user_dict['name'] = f"{admin.first_name} {admin.last_name}"
            elif user.user_type == 'lecturer':
                lecturer = Lecturer.query.filter_by(user_id=user.user_id).first()
                if lecturer:
                    user_dict['first_name'] = lecturer.first_name
                    user_dict['last_name'] = lecturer.last_name
                    user_dict['name'] = f"{lecturer.first_name} {lecturer.last_name}"
            elif user.user_type == 'student':
                student = Student.query.filter_by(user_id=user.user_id).first()
                if student:
                    user_dict['first_name'] = student.first_name
                    user_dict['last_name'] = student.last_name
                    user_dict['name'] = f"{student.first_name} {student.last_name}"
            
            # Add default name if not found
            if 'name' not in user_dict:
                user_dict['name'] = user.username
            
            users_data.append(user_dict)
        
        result = {
            'items': users_data,
            'total': paginated.total,
            'page': paginated.page,
            'pages': paginated.pages,
            'per_page': per_page
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Get user by ID with profile information"""
    try:
        user = User.query.get_or_404(user_id)
        user_dict = user.to_dict()
        
        # Add profile information based on user type
        if user.user_type == 'admin':
            admin = Admin.query.filter_by(user_id=user.user_id).first()
            if admin:
                user_dict['first_name'] = admin.first_name
                user_dict['last_name'] = admin.last_name
                user_dict['name'] = f"{admin.first_name} {admin.last_name}"
        elif user.user_type == 'lecturer':
            lecturer = Lecturer.query.filter_by(user_id=user.user_id).first()
            if lecturer:
                user_dict['first_name'] = lecturer.first_name
                user_dict['last_name'] = lecturer.last_name
                user_dict['name'] = f"{lecturer.first_name} {lecturer.last_name}"
        elif user.user_type == 'student':
            student = Student.query.filter_by(user_id=user.user_id).first()
            if student:
                user_dict['first_name'] = student.first_name
                user_dict['last_name'] = student.last_name
                user_dict['name'] = f"{student.first_name} {student.last_name}"
        
        # Add default name if not found
        if 'name' not in user_dict:
            user_dict['name'] = user.username
        
        return jsonify(user_dict), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/users', methods=['POST'])
@jwt_required()
def create_user():
    """Create new user"""
    try:
        current_user_id = get_current_user_id()
        data = request.get_json()
        
        # Check if email or username already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already exists'}), 400
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username already exists'}), 400
        
        user = User(
            username=data['username'],
            email=data['email'],
            user_type=data['user_type'],
            is_active=True
        )
        user.set_password(data.get('password', 'changeme123'))
        
        db.session.add(user)
        db.session.commit()
        
        log_action(
            current_user_id, 
            'create', 
            'user', 
            user.user_id, 
            f"Created new user: {user.email} ({user.user_type})"
        )
        
        return jsonify(user.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Update user"""
    try:
        current_user_id = get_current_user_id()
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        # Only update fields that are provided
        if 'username' in data:
            user.username = data['username']
        if 'email' in data:
            user.email = data['email']
        if 'firstName' in data:
            user.first_name = data['firstName']
        if 'lastName' in data:
            user.last_name = data['lastName']
        if 'role' in data:
            user.role = data['role']
        if 'status' in data:
            # Map status to is_active
            user.is_active = data['status'] == 'active'
        if 'is_active' in data:
            user.is_active = data['is_active']
        
        db.session.commit()
        
        log_action(
            current_user_id, 
            'update', 
            'user', 
            user.user_id,
            f"Updated user: {user.email}"
        )
        
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Delete user"""
    try:
        current_user_id = get_current_user_id()
        user = User.query.get_or_404(user_id)
        user_email = user.email
        
        db.session.delete(user)
        db.session.commit()
        
        log_action(
            current_user_id, 
            'delete', 
            'user', 
            user_id,
            f"Deleted user: {user_email}"
        )
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/users/<int:user_id>/activate', methods=['PUT'])
@jwt_required()
def activate_user(user_id):
    """Activate user"""
    try:
        user = User.query.get_or_404(user_id)
        user.is_active = True
        db.session.commit()
        return jsonify({'message': 'User activated successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/users/<int:user_id>/deactivate', methods=['PUT'])
@jwt_required()
def deactivate_user(user_id):
    """Deactivate user"""
    try:
        user = User.query.get_or_404(user_id)
        user.is_active = False
        db.session.commit()
        return jsonify({'message': 'User deactivated successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


# ==================== STUDENT MANAGEMENT ====================
@api_bp.route('/admin/students', methods=['GET'])
@jwt_required()
def get_students():
    """Get all students"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        program_id = request.args.get('program_id', type=int)
        
        query = Student.query.join(User).filter(User.is_active == True)
        
        if program_id:
            query = query.filter(Student.program_id == program_id)
        
        result = paginate_query(query, page, per_page)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/students/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student(student_id):
    """Get student by ID"""
    try:
        student = Student.query.get_or_404(student_id)
        return jsonify(student.to_dict()), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/students', methods=['POST'])
@jwt_required()
def create_student():
    """Create new student"""
    try:
        current_user_id = get_current_user_id()
        data = request.get_json()
        
        # Create user account
        user = User(
            username=data['username'],
            email=data['email'],
            user_type='student',
            is_active=True
        )
        user.set_password(data.get('password', 'changeme123'))
        db.session.add(user)
        db.session.flush()
        
        # Create student profile
        student = Student(
            user_id=user.user_id,
            registration_number=data['registration_number'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            program_id=data.get('program_id'),
            current_year=data.get('current_year', 1),
            is_active=True
        )
        db.session.add(student)
        db.session.commit()
        
        log_action(current_user_id, 'create', 'student', student.student_id)
        
        return jsonify(student.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/students/<int:student_id>', methods=['PUT'])
@jwt_required()
def update_student(student_id):
    """Update student"""
    try:
        current_user_id = get_current_user_id()
        student = Student.query.get_or_404(student_id)
        data = request.get_json()
        
        # Update user info
        user = student.user
        user.first_name = data.get('firstName', user.first_name)
        user.last_name = data.get('lastName', user.last_name)
        user.email = data.get('email', user.email)
        
        # Update student info
        student.program_id = data.get('programId', student.program_id)
        student.year_of_study = data.get('yearOfStudy', student.year_of_study)
        
        db.session.commit()
        log_action(current_user_id, 'update', 'student', student_id)
        
        return jsonify(student.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/students/<int:student_id>', methods=['DELETE'])
@jwt_required()
def delete_student(student_id):
    """Delete student"""
    try:
        current_user_id = get_current_user_id()
        student = Student.query.get_or_404(student_id)
        
        db.session.delete(student.user)
        db.session.commit()
        
        log_action(current_user_id, 'delete', 'student', student_id)
        return jsonify({'message': 'Student deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


# ==================== LECTURER MANAGEMENT ====================
@api_bp.route('/admin/lecturers', methods=['GET'])
@jwt_required()
def get_lecturers():
    """Get all lecturers"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        department_id = request.args.get('department_id', type=int)
        
        query = Lecturer.query.join(User).filter(User.is_active == True)
        
        if department_id:
            query = query.filter(Lecturer.department_id == department_id)
        
        result = paginate_query(query, page, per_page)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/lecturers/<int:lecturer_id>', methods=['GET'])
@jwt_required()
def get_lecturer(lecturer_id):
    """Get lecturer by ID"""
    try:
        lecturer = Lecturer.query.get_or_404(lecturer_id)
        return jsonify(lecturer.to_dict()), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/lecturers', methods=['POST'])
@jwt_required()
def create_lecturer():
    """Create new lecturer"""
    try:
        current_user_id = get_current_user_id()
        data = request.get_json()
        
        # Create user account
        user = User(
            username=data['username'],
            email=data['email'],
            user_type='lecturer',
            is_active=True
        )
        user.set_password(data.get('password', 'changeme123'))
        db.session.add(user)
        db.session.flush()
        
        # Create lecturer profile
        lecturer = Lecturer(
            user_id=user.user_id,
            staff_id=data['staff_id'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            department_id=data.get('department_id'),
            title=data.get('title'),
            is_active=True
        )
        db.session.add(lecturer)
        db.session.commit()
        
        log_action(current_user_id, 'create', 'lecturer', lecturer.lecturer_id)
        
        return jsonify(lecturer.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/lecturers/<int:lecturer_id>', methods=['PUT'])
@jwt_required()
def update_lecturer(lecturer_id):
    """Update lecturer"""
    try:
        current_user_id = get_current_user_id()
        lecturer = Lecturer.query.get_or_404(lecturer_id)
        data = request.get_json()
        
        # Update user info
        user = lecturer.user
        user.first_name = data.get('firstName', user.first_name)
        user.last_name = data.get('lastName', user.last_name)
        user.email = data.get('email', user.email)
        
        # Update lecturer info
        lecturer.department_id = data.get('departmentId', lecturer.department_id)
        lecturer.title = data.get('title', lecturer.title)
        
        db.session.commit()
        log_action(current_user_id, 'update', 'lecturer', lecturer_id)
        
        return jsonify(lecturer.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/lecturers/<int:lecturer_id>', methods=['DELETE'])
@jwt_required()
def delete_lecturer(lecturer_id):
    """Delete lecturer"""
    try:
        current_user_id = get_current_user_id()
        lecturer = Lecturer.query.get_or_404(lecturer_id)
        
        db.session.delete(lecturer.user)
        db.session.commit()
        
        log_action(current_user_id, 'delete', 'lecturer', lecturer_id)
        return jsonify({'message': 'Lecturer deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


# ==================== ADMIN MANAGEMENT ====================
@api_bp.route('/admin/admins', methods=['GET'])
@jwt_required()
def get_admins():
    """Get all admins"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        query = Admin.query.join(User)
        result = paginate_query(query, page, per_page)
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/admins/<int:admin_id>', methods=['GET'])
@jwt_required()
def get_admin(admin_id):
    """Get admin by ID"""
    try:
        admin = Admin.query.get_or_404(admin_id)
        return jsonify(admin.to_dict()), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/admins', methods=['POST'])
@jwt_required()
def create_admin():
    """Create new admin"""
    try:
        current_user_id = get_current_user_id()
        data = request.get_json()
        
        # Create user account
        user = User(
            username=data['username'],
            email=data['email'],
            user_type='admin',
            is_active=True
        )
        user.set_password(data.get('password', 'changeme123'))
        db.session.add(user)
        db.session.flush()
        
        # Create admin profile
        admin = Admin(
            user_id=user.user_id,
            staff_id=data['staff_id'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            admin_role=data.get('admin_role', 'System Admin'),
            permissions=data.get('permissions', {}),
            department_id=data.get('department_id'),
            is_active=True
        )
        db.session.add(admin)
        db.session.commit()
        
        log_action(current_user_id, 'create', 'admin', admin.admin_id)
        
        return jsonify(admin.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/admins/<int:admin_id>', methods=['PUT'])
@jwt_required()
def update_admin(admin_id):
    """Update admin"""
    try:
        current_user_id = get_current_user_id()
        admin = Admin.query.get_or_404(admin_id)
        data = request.get_json()
        
        # Update user info
        user = admin.user
        user.first_name = data.get('firstName', user.first_name)
        user.last_name = data.get('lastName', user.last_name)
        user.email = data.get('email', user.email)
        
        # Update admin info
        admin.permissions = data.get('permissions', admin.permissions)
        admin.department = data.get('department', admin.department)
        
        db.session.commit()
        log_action(current_user_id, 'update', 'admin', admin_id)
        
        return jsonify(admin.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/admins/<int:admin_id>', methods=['DELETE'])
@jwt_required()
def delete_admin(admin_id):
    """Delete admin"""
    try:
        current_user_id = get_current_user_id()
        admin = Admin.query.get_or_404(admin_id)
        
        db.session.delete(admin.user)
        db.session.commit()
        
        log_action(current_user_id, 'delete', 'admin', admin_id)
        return jsonify({'message': 'Admin deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


# ==================== INSTITUTIONAL HIERARCHY ====================
# Schools
@api_bp.route('/admin/schools', methods=['GET'])
@jwt_required()
def get_schools():
    """Get all schools"""
    try:
        schools = School.query.all()
        return jsonify([school.to_dict() for school in schools]), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/schools/<int:school_id>', methods=['GET'])
@jwt_required()
def get_school(school_id):
    """Get school by ID"""
    try:
        school = School.query.get_or_404(school_id)
        return jsonify(school.to_dict()), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/schools', methods=['POST'])
@jwt_required()
def create_school():
    """Create new school"""
    try:
        current_user_id = get_current_user_id()
        data = request.get_json()
        
        school = School(
            name=data['name'],
            code=data['code'],
            description=data.get('description', '')
        )
        db.session.add(school)
        db.session.commit()
        
        log_action(current_user_id, 'create', 'school', school.id)
        
        return jsonify(school.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/schools/<int:school_id>', methods=['PUT'])
@jwt_required()
def update_school(school_id):
    """Update school"""
    try:
        current_user_id = get_current_user_id()
        school = School.query.get_or_404(school_id)
        data = request.get_json()
        
        school.name = data.get('name', school.name)
        school.code = data.get('code', school.code)
        school.description = data.get('description', school.description)
        
        db.session.commit()
        log_action(current_user_id, 'update', 'school', school_id)
        
        return jsonify(school.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/schools/<int:school_id>', methods=['DELETE'])
@jwt_required()
def delete_school(school_id):
    """Delete school"""
    try:
        current_user_id = get_current_user_id()
        school = School.query.get_or_404(school_id)
        
        db.session.delete(school)
        db.session.commit()
        
        log_action(current_user_id, 'delete', 'school', school_id)
        return jsonify({'message': 'School deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


# Departments
@api_bp.route('/admin/departments', methods=['GET'])
@jwt_required()
def get_departments():
    """Get all departments"""
    try:
        school_id = request.args.get('school_id', type=int)
        query = Department.query
        
        if school_id:
            query = query.filter_by(school_id=school_id)
        
        departments = query.all()
        return jsonify([dept.to_dict() for dept in departments]), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/departments/<int:dept_id>', methods=['GET'])
@jwt_required()
def get_department(dept_id):
    """Get department by ID"""
    try:
        dept = Department.query.get_or_404(dept_id)
        return jsonify(dept.to_dict()), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/departments', methods=['POST'])
@jwt_required()
def create_department():
    """Create new department"""
    try:
        current_user_id = get_current_user_id()
        data = request.get_json()
        
        dept = Department(
            name=data['name'],
            code=data['code'],
            school_id=data['schoolId'],
            description=data.get('description', '')
        )
        db.session.add(dept)
        db.session.commit()
        
        log_action(current_user_id, 'create', 'department', dept.id)
        
        return jsonify(dept.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/departments/<int:dept_id>', methods=['PUT'])
@jwt_required()
def update_department(dept_id):
    """Update department"""
    try:
        current_user_id = get_current_user_id()
        dept = Department.query.get_or_404(dept_id)
        data = request.get_json()
        
        dept.name = data.get('name', dept.name)
        dept.code = data.get('code', dept.code)
        dept.school_id = data.get('schoolId', dept.school_id)
        dept.description = data.get('description', dept.description)
        
        db.session.commit()
        log_action(current_user_id, 'update', 'department', dept_id)
        
        return jsonify(dept.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/departments/<int:dept_id>', methods=['DELETE'])
@jwt_required()
def delete_department(dept_id):
    """Delete department"""
    try:
        current_user_id = get_current_user_id()
        dept = Department.query.get_or_404(dept_id)
        
        db.session.delete(dept)
        db.session.commit()
        
        log_action(current_user_id, 'delete', 'department', dept_id)
        return jsonify({'message': 'Department deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


# Programs
@api_bp.route('/admin/programs', methods=['GET'])
@jwt_required()
def get_programs():
    """Get all programs"""
    try:
        department_id = request.args.get('department_id', type=int)
        query = Program.query
        
        if department_id:
            query = query.filter_by(department_id=department_id)
        
        programs = query.all()
        return jsonify([prog.to_dict() for prog in programs]), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/programs/<int:program_id>', methods=['GET'])
@jwt_required()
def get_program(program_id):
    """Get program by ID"""
    try:
        program = Program.query.get_or_404(program_id)
        return jsonify(program.to_dict()), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/programs', methods=['POST'])
@jwt_required()
def create_program():
    """Create new program"""
    try:
        current_user_id = get_current_user_id()
        data = request.get_json()
        
        program = Program(
            name=data['name'],
            code=data['code'],
            department_id=data['departmentId'],
            duration_years=data.get('durationYears', 4),
            description=data.get('description', '')
        )
        db.session.add(program)
        db.session.commit()
        
        log_action(current_user_id, 'create', 'program', program.id)
        
        return jsonify(program.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/programs/<int:program_id>', methods=['PUT'])
@jwt_required()
def update_program(program_id):
    """Update program"""
    try:
        current_user_id = get_current_user_id()
        program = Program.query.get_or_404(program_id)
        data = request.get_json()
        
        program.name = data.get('name', program.name)
        program.code = data.get('code', program.code)
        program.department_id = data.get('departmentId', program.department_id)
        program.duration_years = data.get('durationYears', program.duration_years)
        program.description = data.get('description', program.description)
        
        db.session.commit()
        log_action(current_user_id, 'update', 'program', program_id)
        
        return jsonify(program.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/programs/<int:program_id>', methods=['DELETE'])
@jwt_required()
def delete_program(program_id):
    """Delete program"""
    try:
        current_user_id = get_current_user_id()
        program = Program.query.get_or_404(program_id)
        
        db.session.delete(program)
        db.session.commit()
        
        log_action(current_user_id, 'delete', 'program', program_id)
        return jsonify({'message': 'Program deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


# Units
@api_bp.route('/admin/units', methods=['GET'])
@jwt_required()
def get_units():
    """Get all units"""
    try:
        department_id = request.args.get('department_id', type=int)
        query = Unit.query
        
        if department_id:
            query = query.filter_by(department_id=department_id)
        
        units = query.all()
        return jsonify([unit.to_dict() for unit in units]), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/units/<int:unit_id>', methods=['GET'])
@jwt_required()
def get_unit(unit_id):
    """Get unit by ID"""
    try:
        unit = Unit.query.get_or_404(unit_id)
        return jsonify(unit.to_dict()), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/units', methods=['POST'])
@jwt_required()
def create_unit():
    """Create new unit"""
    try:
        current_user_id = get_current_user_id()
        data = request.get_json()
        
        unit = Unit(
            name=data['name'],
            code=data['code'],
            department_id=data.get('departmentId'),
            credits=data.get('credits', 3),
            description=data.get('description', '')
        )
        db.session.add(unit)
        db.session.commit()
        
        log_action(current_user_id, 'create', 'unit', unit.id)
        
        return jsonify(unit.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/units/<int:unit_id>', methods=['PUT'])
@jwt_required()
def update_unit(unit_id):
    """Update unit"""
    try:
        current_user_id = get_current_user_id()
        unit = Unit.query.get_or_404(unit_id)
        data = request.get_json()
        
        unit.name = data.get('name', unit.name)
        unit.code = data.get('code', unit.code)
        unit.department_id = data.get('departmentId', unit.department_id)
        unit.credits = data.get('credits', unit.credits)
        unit.description = data.get('description', unit.description)
        
        db.session.commit()
        log_action(current_user_id, 'update', 'unit', unit_id)
        
        return jsonify(unit.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/units/<int:unit_id>', methods=['DELETE'])
@jwt_required()
def delete_unit(unit_id):
    """Delete unit"""
    try:
        current_user_id = get_current_user_id()
        unit = Unit.query.get_or_404(unit_id)
        
        db.session.delete(unit)
        db.session.commit()
        
        log_action(current_user_id, 'delete', 'unit', unit_id)
        return jsonify({'message': 'Unit deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@api_bp.route('/admin/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        stats = {
            'totalStudents': User.query.filter_by(user_type='student').count(),
            'totalLecturers': User.query.filter_by(user_type='lecturer').count(),
            'totalVenues': Class.query.count(),
            'totalBeacons': Beacon.query.count(),
        }
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/dashboard/recent-activity', methods=['GET'])
@jwt_required()
def get_recent_activity():
    """Get recent activity from audit logs"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        query = AuditLog.query.order_by(AuditLog.created_at.desc())
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        activities = []
        for log in paginated.items:
            activity = {
                'id': log.log_id,
                'action_type': log.action_type,
                'entity_type': log.entity_type,
                'entity_id': log.entity_id,
                'description': log.action_description,
                'user_id': log.user_id,
                'created_at': log.created_at.isoformat() + 'Z' if log.created_at else None,  # Add Z to indicate UTC
                'completed': False,  # Default state for activity tracking
            }
            
            # Get user info if available
            if log.user:
                activity['username'] = log.user.username
                activity['user_email'] = log.user.email
            
            activities.append(activity)
        
        result = {
            'items': activities,
            'total': paginated.total,
            'page': paginated.page,
            'pages': paginated.pages,
            'per_page': per_page
        }
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/dashboard/activity/<int:log_id>', methods=['DELETE'])
@jwt_required()
def delete_activity(log_id):
    """Delete an activity log"""
    try:
        current_user_id = get_current_user_id()
        log = AuditLog.query.get_or_404(log_id)
        
        db.session.delete(log)
        db.session.commit()
        
        log_action(current_user_id, 'delete', 'audit_log', log_id, f'Deleted activity log {log_id}')
        
        return jsonify({'message': 'Activity deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/dashboard/today-classes', methods=['GET'])
@jwt_required()
def get_today_classes():
    """Get today's classes from timetable"""
    try:
        from datetime import datetime, date
        
        # Get today's day of week
        today = date.today()
        day_name = today.strftime('%A')  # Monday, Tuesday, etc.
        
        # Query timetable entries for today
        query = TimetableEntry.query.filter(
            TimetableEntry.day_of_week == day_name,
            TimetableEntry.is_active == True
        ).order_by(TimetableEntry.start_time)
        
        # Check effective dates if set
        query = query.filter(
            db.or_(
                TimetableEntry.effective_start_date == None,
                TimetableEntry.effective_start_date <= today
            ),
            db.or_(
                TimetableEntry.effective_end_date == None,
                TimetableEntry.effective_end_date >= today
            )
        )
        
        entries = query.all()
        
        classes = []
        for entry in entries:
            class_data = {
                'id': entry.timetable_id,
                'start_time': entry.start_time.strftime('%H:%M') if entry.start_time else None,
                'end_time': entry.end_time.strftime('%H:%M') if entry.end_time else None,
                'session_type': entry.session_type,
                'unit_code': entry.unit.unit_code if entry.unit else 'N/A',
                'unit_name': entry.unit.unit_name if entry.unit else 'Unknown Unit',
                'venue_name': entry.venue.class_name if entry.venue else 'TBA',
                'venue_location': entry.venue.location if entry.venue else '',
                'lecturer_name': None,
                'lecturer_title': None
            }
            
            # Get lecturer name and title from Lecturer model
            if entry.lecturer:
                lecturer = entry.lecturer
                # Build full name from first_name, middle_name, last_name
                name_parts = [lecturer.first_name]
                if lecturer.middle_name:
                    name_parts.append(lecturer.middle_name)
                if lecturer.last_name:
                    name_parts.append(lecturer.last_name)
                class_data['lecturer_name'] = ' '.join(name_parts) if name_parts else 'TBA'
                class_data['lecturer_title'] = lecturer.title if lecturer.title else None
            
            classes.append(class_data)
        
        return jsonify({'items': classes, 'total': len(classes), 'day': day_name}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    try:
        user_id = get_current_user_id()
        user = User.query.get_or_404(user_id)
        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user profile"""
    try:
        user_id = get_current_user_id()
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        # Only update fields that are provided
        if 'firstName' in data:
            user.first_name = data['firstName']
        if 'lastName' in data:
            user.last_name = data['lastName']
        if 'email' in data:
            user.email = data['email']
        
        db.session.commit()
        log_action(user_id, 'update', 'profile', user_id)
        
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


# ==================== VENUE/CLASS MANAGEMENT ====================
@api_bp.route('/admin/venues', methods=['GET'])
@jwt_required()
def get_venues():
    """Get all venues/classes"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        query = Class.query
        result = paginate_query(query, page, per_page)
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/venues/<int:venue_id>', methods=['GET'])
@jwt_required()
def get_venue(venue_id):
    """Get venue by ID"""
    try:
        venue = Class.query.get_or_404(venue_id)
        return jsonify(venue.to_dict()), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/venues', methods=['POST'])
@jwt_required()
def create_venue():
    """Create new venue"""
    try:
        current_user_id = get_current_user_id()
        data = request.get_json()
        
        venue = Class(
            class_name=data.get('class_name', data.get('name', '')),
            class_code=data.get('class_code', data.get('code', '')),
            building=data.get('building', ''),
            floor=data.get('floor', ''),
            capacity=data.get('capacity', 0),
            class_type=data.get('class_type', data.get('type', 'Lecture Hall')),
            location_description=data.get('location_description', data.get('description', '')),
            has_projector=data.get('has_projector', False),
            has_computers=data.get('has_computers', False),
            is_active=data.get('is_active', True)
        )
        db.session.add(venue)
        db.session.commit()
        
        log_action(current_user_id, 'create', 'venue', venue.class_id)
        
        return jsonify(venue.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/venues/<int:venue_id>', methods=['PUT'])
@jwt_required()
def update_venue(venue_id):
    """Update venue"""
    try:
        current_user_id = get_current_user_id()
        venue = Class.query.get_or_404(venue_id)
        data = request.get_json()
        
        # Update using correct field names
        if 'class_name' in data:
            venue.class_name = data['class_name']
        if 'class_code' in data:
            venue.class_code = data['class_code']
        if 'building' in data:
            venue.building = data['building']
        if 'floor' in data:
            venue.floor = data['floor']
        if 'capacity' in data:
            venue.capacity = data['capacity']
        if 'class_type' in data:
            venue.class_type = data['class_type']
        if 'location_description' in data:
            venue.location_description = data['location_description']
        if 'has_projector' in data:
            venue.has_projector = data['has_projector']
        if 'has_computers' in data:
            venue.has_computers = data['has_computers']
        if 'is_active' in data:
            venue.is_active = data['is_active']
        
        db.session.commit()
        log_action(current_user_id, 'update', 'venue', venue_id)
        
        return jsonify(venue.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/venues/<int:venue_id>', methods=['DELETE'])
@jwt_required()
def delete_venue(venue_id):
    """Delete venue"""
    try:
        current_user_id = get_current_user_id()
        venue = Class.query.get_or_404(venue_id)
        
        # First, delete all related class_beacon assignments
        ClassBeacon.query.filter_by(class_id=venue_id).delete()
        
        # Delete any timetable entries for this venue
        TimetableEntry.query.filter_by(class_id=venue_id).delete()
        
        # Now delete the venue
        db.session.delete(venue)
        db.session.commit()
        
        log_action(current_user_id, 'delete', 'venue', venue_id)
        return jsonify({'message': 'Venue deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


# ==================== BEACON MANAGEMENT ====================
@api_bp.route('/admin/beacons', methods=['GET'])
@jwt_required()
def get_beacons():
    """Get all beacons"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        beacon_status = request.args.get('beacon_status')
        
        query = Beacon.query
        
        if beacon_status:
            query = query.filter_by(beacon_status=beacon_status)
        
        result = paginate_query(query, page, per_page)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/beacons/<int:beacon_id>', methods=['GET'])
@jwt_required()
def get_beacon(beacon_id):
    """Get beacon by ID"""
    try:
        beacon = Beacon.query.get_or_404(beacon_id)
        return jsonify(beacon.to_dict()), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/beacons/register', methods=['POST'])
@jwt_required()
def register_beacon():
    """Register new beacon"""
    try:
        current_user_id = get_current_user_id()
        data = request.get_json()
        
        # Check if beacon already exists
        existing = Beacon.query.filter_by(beacon_uuid=data['beacon_uuid']).first()
        if existing:
            return jsonify({'message': 'Beacon already registered'}), 400
        
        beacon = Beacon(
            beacon_uuid=data['beacon_uuid'],
            beacon_major=data['beacon_major'],
            beacon_minor=data['beacon_minor'],
            beacon_name=data.get('beacon_name', ''),
            beacon_status='Active',
            is_active=True
        )
        db.session.add(beacon)
        db.session.commit()
        
        log_action(current_user_id, 'register', 'beacon', beacon.beacon_id)
        
        return jsonify(beacon.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/beacons/<int:beacon_id>', methods=['PUT'])
@jwt_required()
def update_beacon(beacon_id):
    """Update beacon"""
    try:
        current_user_id = get_current_user_id()
        beacon = Beacon.query.get_or_404(beacon_id)
        data = request.get_json()
        
        beacon.beacon_name = data.get('beacon_name', beacon.beacon_name)
        beacon.beacon_status = data.get('beacon_status', beacon.beacon_status)
        beacon.battery_level = data.get('battery_level', beacon.battery_level)
        
        db.session.commit()
        log_action(current_user_id, 'update', 'beacon', beacon_id)
        
        return jsonify(beacon.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/beacons/<int:beacon_id>', methods=['DELETE'])
@jwt_required()
def delete_beacon(beacon_id):
    """Delete beacon"""
    try:
        current_user_id = get_current_user_id()
        beacon = Beacon.query.get_or_404(beacon_id)
        
        db.session.delete(beacon)
        db.session.commit()
        
        log_action(current_user_id, 'delete', 'beacon', beacon_id)
        return jsonify({'message': 'Beacon deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/beacons/<int:beacon_id>/assign', methods=['POST'])
@jwt_required()
def assign_beacon(beacon_id):
    """Assign beacon to venue"""
    try:
        current_user_id = get_current_user_id()
        data = request.get_json()
        
        # Check if beacon exists
        beacon = Beacon.query.get_or_404(beacon_id)
        venue_id = data.get('venueId')
        
        # Check if already assigned
        existing = ClassBeacon.query.filter_by(
            beacon_id=beacon_id,
            class_id=venue_id
        ).first()
        
        if existing:
            return jsonify({'message': 'Beacon already assigned to this venue'}), 400
        
        assignment = ClassBeacon(
            beacon_id=beacon_id,
            class_id=venue_id,
            is_primary=data.get('isPrimary', True)
        )
        db.session.add(assignment)
        db.session.commit()
        
        log_action(current_user_id, 'assign', 'beacon', beacon_id, {'venue_id': venue_id})
        
        return jsonify(assignment.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/beacons/<int:beacon_id>/unassign/<int:venue_id>', methods=['DELETE'])
@jwt_required()
def unassign_beacon(beacon_id, venue_id):
    """Unassign beacon from venue"""
    try:
        current_user_id = get_current_user_id()
        
        assignment = ClassBeacon.query.filter_by(
            beacon_id=beacon_id,
            class_id=venue_id
        ).first_or_404()
        
        db.session.delete(assignment)
        db.session.commit()
        
        log_action(current_user_id, 'unassign', 'beacon', beacon_id, {'venue_id': venue_id})
        
        return jsonify({'message': 'Beacon unassigned successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


# ==================== TIMETABLE MANAGEMENT ====================
@api_bp.route('/admin/timetable', methods=['GET'])
@jwt_required()
def get_timetable():
    """Get timetable entries"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        unit_id = request.args.get('unit_id', type=int)
        lecturer_id = request.args.get('lecturer_id', type=int)
        venue_id = request.args.get('venue_id', type=int)
        
        query = TimetableEntry.query
        
        if unit_id:
            query = query.filter_by(unit_id=unit_id)
        if lecturer_id:
            query = query.filter_by(lecturer_id=lecturer_id)
        if venue_id:
            query = query.filter_by(class_id=venue_id)
        
        # Get paginated results
        page = max(1, page)
        per_page = min(per_page, 100)
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Build response with relationships
        items = []
        for entry in paginated.items:
            entry_dict = {
                'timetable_id': entry.timetable_id,
                'unit_id': entry.unit_id,
                'lecturer_id': entry.lecturer_id,
                'class_id': entry.class_id,
                'academic_year': entry.academic_year,
                'semester': entry.semester,
                'day_of_week': entry.day_of_week,
                'start_time': entry.start_time.strftime('%H:%M') if entry.start_time else None,
                'end_time': entry.end_time.strftime('%H:%M') if entry.end_time else None,
                'session_type': entry.session_type,
                'recurrence_pattern': entry.recurrence_pattern,
                'effective_start_date': entry.effective_start_date.isoformat() if entry.effective_start_date else None,
                'effective_end_date': entry.effective_end_date.isoformat() if entry.effective_end_date else None,
                'is_active': entry.is_active,
                'created_at': entry.created_at.isoformat() + 'Z' if entry.created_at else None,
                'updated_at': entry.updated_at.isoformat() + 'Z' if entry.updated_at else None,
            }
            
            # Add related objects with safe access
            if entry.unit:
                entry_dict['unit'] = {
                    'unit_id': entry.unit.unit_id,
                    'unit_code': entry.unit.unit_code,
                    'unit_name': entry.unit.unit_name,
                }
            
            if entry.lecturer:
                lecturer_name_parts = [entry.lecturer.first_name]
                if entry.lecturer.middle_name:
                    lecturer_name_parts.append(entry.lecturer.middle_name)
                if entry.lecturer.last_name:
                    lecturer_name_parts.append(entry.lecturer.last_name)
                
                entry_dict['lecturer'] = {
                    'lecturer_id': entry.lecturer.lecturer_id,
                    'staff_id': entry.lecturer.staff_id,
                    'first_name': entry.lecturer.first_name,
                    'last_name': entry.lecturer.last_name,
                    'title': entry.lecturer.title,
                    'name': ' '.join(lecturer_name_parts),
                }
            
            if entry.venue:
                entry_dict['class'] = {
                    'class_id': entry.venue.class_id,
                    'class_name': entry.venue.class_name,
                    'building': entry.venue.building,
                    'capacity': entry.venue.capacity,
                }
                
            items.append(entry_dict)
        
        result = {
            'items': items,
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages,
            'has_next': paginated.has_next,
            'has_prev': paginated.has_prev
        }
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/timetable/<int:entry_id>', methods=['GET'])
@jwt_required()
def get_timetable_entry(entry_id):
    """Get timetable entry by ID"""
    try:
        entry = TimetableEntry.query.get_or_404(entry_id)
        return jsonify(entry.to_dict()), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/timetable', methods=['POST'])
@jwt_required()
def create_timetable_entry():
    """Create timetable entry"""
    try:
        current_user_id = get_current_user_id()
        data = request.get_json()
        
        from datetime import time
        
        entry = TimetableEntry(
            unit_id=data['unitId'],
            lecturer_id=data['lecturerId'],
            class_id=data['venueId'],
            day_of_week=data['dayOfWeek'],
            start_time=time.fromisoformat(data['startTime']),
            end_time=time.fromisoformat(data['endTime']),
            session_type=data.get('sessionType', 'lecture')
        )
        db.session.add(entry)
        db.session.commit()
        
        log_action(current_user_id, 'create', 'timetable', entry.id)
        
        return jsonify(entry.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/timetable/<int:entry_id>', methods=['PUT'])
@jwt_required()
def update_timetable_entry(entry_id):
    """Update timetable entry"""
    try:
        current_user_id = get_current_user_id()
        entry = TimetableEntry.query.get_or_404(entry_id)
        data = request.get_json()
        
        from datetime import time
        
        entry.unit_id = data.get('unitId', entry.unit_id)
        entry.lecturer_id = data.get('lecturerId', entry.lecturer_id)
        entry.class_id = data.get('venueId', entry.class_id)
        entry.day_of_week = data.get('dayOfWeek', entry.day_of_week)
        
        if 'startTime' in data:
            entry.start_time = time.fromisoformat(data['startTime'])
        if 'endTime' in data:
            entry.end_time = time.fromisoformat(data['endTime'])
        
        entry.session_type = data.get('sessionType', entry.session_type)
        
        db.session.commit()
        log_action(current_user_id, 'update', 'timetable', entry_id)
        
        return jsonify(entry.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/timetable/<int:entry_id>', methods=['DELETE'])
@jwt_required()
def delete_timetable_entry(entry_id):
    """Delete timetable entry"""
    try:
        current_user_id = get_current_user_id()
        entry = TimetableEntry.query.get_or_404(entry_id)
        
        db.session.delete(entry)
        db.session.commit()
        
        log_action(current_user_id, 'delete', 'timetable', entry_id)
        return jsonify({'message': 'Timetable entry deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/timetable/import', methods=['POST'])
@jwt_required()
def import_timetable():
    """Bulk import timetable entries"""
    try:
        current_user_id = get_current_user_id()
        data = request.get_json()
        entries = data.get('entries', [])
        
        from datetime import time
        
        created_count = 0
        errors = []
        
        for idx, entry_data in enumerate(entries):
            try:
                entry = TimetableEntry(
                    unit_id=entry_data['unitId'],
                    lecturer_id=entry_data['lecturerId'],
                    class_id=entry_data['venueId'],
                    day_of_week=entry_data['dayOfWeek'],
                    start_time=time.fromisoformat(entry_data['startTime']),
                    end_time=time.fromisoformat(entry_data['endTime']),
                    session_type=entry_data.get('sessionType', 'lecture')
                )
                db.session.add(entry)
                created_count += 1
            except Exception as e:
                errors.append(f"Row {idx + 1}: {str(e)}")
        
        if created_count > 0:
            db.session.commit()
            log_action(current_user_id, 'import', 'timetable', None, {'count': created_count})
        
        response = {
            'message': f'{created_count} entries imported successfully',
            'created': created_count,
            'errors': errors
        }
        
        return jsonify(response), 201 if created_count > 0 else 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/timetable/import-file', methods=['POST'])
@jwt_required()
def import_timetable_file():
    """Import timetable from CSV file"""
    try:
        current_user_id = get_current_user_id()
        
        if 'file' not in request.files:
            return jsonify({'message': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
        
        if not file.filename.endswith('.csv'):
            return jsonify({'message': 'Only CSV files are supported'}), 400
        
        import csv
        import io
        from datetime import time
        
        # Read CSV file
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        created_count = 0
        errors = []
        
        for idx, row in enumerate(csv_reader, start=2):  # Start at 2 (row 1 is header)
            try:
                # Map CSV columns to database fields
                entry = TimetableEntry(
                    unit_id=int(row.get('unit_id') or row.get('unitId')),
                    lecturer_id=int(row.get('lecturer_id') or row.get('lecturerId')),
                    class_id=int(row.get('class_id') or row.get('venueId')),
                    day_of_week=row.get('day_of_week') or row.get('dayOfWeek'),
                    start_time=time.fromisoformat(row.get('start_time') or row.get('startTime')),
                    end_time=time.fromisoformat(row.get('end_time') or row.get('endTime')),
                    session_type=row.get('session_type') or row.get('sessionType') or 'lecture'
                )
                db.session.add(entry)
                created_count += 1
            except Exception as e:
                errors.append(f"Row {idx}: {str(e)}")
        
        if created_count > 0:
            db.session.commit()
            log_action(current_user_id, 'import_file', 'timetable', None, {'count': created_count})
        
        response = {
            'message': f'{created_count} entries imported successfully',
            'created': created_count,
            'errors': errors
        }
        
        return jsonify(response), 201 if created_count > 0 else 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


# ==================== SYSTEM SETTINGS ====================
@api_bp.route('/admin/settings', methods=['GET'])
@jwt_required()
def get_settings():
    """Get all system settings"""
    try:
        settings = SystemSettings.query.all()
        settings_dict = {s.key: s.value for s in settings}
        return jsonify(settings_dict), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/settings/<string:key>', methods=['GET'])
@jwt_required()
def get_setting(key):
    """Get specific setting"""
    try:
        setting = SystemSettings.query.filter_by(key=key).first_or_404()
        return jsonify(setting.to_dict()), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/settings', methods=['POST', 'PUT'])
@jwt_required()
def update_settings():
    """Update system settings"""
    try:
        current_user_id = get_current_user_id()
        data = request.get_json()
        
        for key, value in data.items():
            setting = SystemSettings.query.filter_by(key=key).first()
            
            if setting:
                setting.value = str(value)
            else:
                setting = SystemSettings(key=key, value=str(value))
                db.session.add(setting)
        
        db.session.commit()
        log_action(current_user_id, 'update', 'settings', None, {'keys': list(data.keys())})
        
        return jsonify({'message': 'Settings updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


# ==================== AUDIT LOGS ====================
@api_bp.route('/admin/audit-logs', methods=['GET'])
@jwt_required()
def get_audit_logs():
    """Get audit logs"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        user_id = request.args.get('user_id', type=int)
        action = request.args.get('action')
        entity_type = request.args.get('entity_type')
        
        query = AuditLog.query.order_by(AuditLog.created_at.desc())
        
        if user_id:
            query = query.filter_by(user_id=user_id)
        if action:
            query = query.filter_by(action=action)
        if entity_type:
            query = query.filter_by(entity_type=entity_type)
        
        result = paginate_query(query, page, per_page)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/audit-logs/<int:log_id>', methods=['GET'])
@jwt_required()
def get_audit_log(log_id):
    """Get specific audit log"""
    try:
        log = AuditLog.query.get_or_404(log_id)
        return jsonify(log.to_dict()), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/audit-logs/search', methods=['POST'])
@jwt_required()
def search_audit_logs():
    """Search audit logs with filters"""
    try:
        data = request.get_json()
        page = data.get('page', 1)
        per_page = data.get('per_page', 50)
        
        query = AuditLog.query.order_by(AuditLog.created_at.desc())
        
        if 'user_id' in data:
            query = query.filter_by(user_id=data['user_id'])
        if 'action' in data:
            query = query.filter_by(action=data['action'])
        if 'entity_type' in data:
            query = query.filter_by(entity_type=data['entity_type'])
        if 'start_date' in data:
            from datetime import datetime
            start_date = datetime.fromisoformat(data['start_date'])
            query = query.filter(AuditLog.created_at >= start_date)
        if 'end_date' in data:
            from datetime import datetime
            end_date = datetime.fromisoformat(data['end_date'])
            query = query.filter(AuditLog.created_at <= end_date)
        
        result = paginate_query(query, page, per_page)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/audit-logs/summary', methods=['GET'])
@jwt_required()
def get_audit_summary():
    """Get audit log summary statistics"""
    try:
        from sqlalchemy import func
        
        # Action counts
        action_counts = db.session.query(
            AuditLog.action,
            func.count(AuditLog.id)
        ).group_by(AuditLog.action).all()
        
        # Recent activity
        recent = AuditLog.query.order_by(
            AuditLog.created_at.desc()
        ).limit(10).all()
        
        summary = {
            'actionCounts': {action: count for action, count in action_counts},
            'recentActivity': [log.to_dict() for log in recent],
            'totalLogs': AuditLog.query.count()
        }
        
        return jsonify(summary), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


# ==================== REPORTS & ANALYTICS ====================
@api_bp.route('/admin/reports/attendance/stats', methods=['GET'])
@jwt_required()
def get_attendance_stats():
    """Get attendance statistics"""
    try:
        # This would connect to attendance records when implemented
        stats = {
            'totalSessions': 0,
            'averageAttendance': 0,
            'topAttendingStudents': [],
            'lowAttendingStudents': []
        }
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/admin/reports/attendance/export', methods=['POST'])
@jwt_required()
def export_attendance_report():
    """Export attendance report"""
    try:
        data = request.get_json()
        # Implementation for CSV/Excel export would go here
        return jsonify({'message': 'Report export queued', 'downloadUrl': '/downloads/report.csv'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
