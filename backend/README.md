# UniAttend Backend

Flask REST API backend for the UniAttend attendance tracking system.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py       # Flask app factory
│   ├── models.py         # Database models
│   └── routes.py         # API endpoints
├── instance/             # Instance-specific files (databases, etc.)
├── migrations/           # Database migrations (created after init)
├── config.py             # Configuration settings
├── run.py                # Application entry point
├── requirements.txt      # Python dependencies
└── .env                  # Environment variables (create from .env.example)
```

## Setup Instructions

### 1. Create Virtual Environment

```powershell
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate
```

### 2. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 3. Configure Environment Variables

```powershell
# Copy the example file
copy .env.example .env

# Edit .env and update with your settings
# - SECRET_KEY: Generate a secure random key
# - MYSQL_USER: Your MySQL username (default: root)
# - MYSQL_PASSWORD: Your MySQL password
# - MYSQL_DATABASE: Database name (default: uniattend)
```

**Note:** This application uses **MySQL** as the database. See `MYSQL_SETUP.md` for detailed MySQL setup instructions.

### 4. Create MySQL Database

```sql
CREATE DATABASE uniattend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Initialize Database

```powershell
# Initialize Flask-Migrate
flask db init

# Create initial migration
flask db migrate -m "Initial migration"

# Apply migration
flask db upgrade
```

### 6. Seed Database (Optional)

```powershell
python seed.py
```

This will create:
- Admin user: admin@uniattend.com / admin123
- Sample schools, departments, programs
- Sample students, lecturers, venues, beacons

### 7. Run the Application

```powershell
# Development mode
python run.py

# Or using Flask CLI
flask run
```

The API will be available at: `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/logout` - Admin logout
- `POST /api/admin/auth/change-password` - Change password

### User Management
- `GET /api/admin/users` - Get all users (paginated)
- `GET /api/admin/users/:id` - Get user by ID
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/users/:id/activate` - Activate user
- `PUT /api/admin/users/:id/deactivate` - Deactivate user

### Students
- `GET /api/admin/students` - Get all students

### Dashboard
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

### Profile
- `GET /api/admin/profile` - Get current user profile

## Database Models

- **User** - Base authentication model
- **Admin** - Admin user profile
- **Student** - Student profile
- **Lecturer** - Lecturer profile
- **School** - School/Faculty
- **Department** - Department
- **Program** - Academic program
- **Unit** - Course unit/module
- **ProgramUnit** - Program-Unit relationship
- **Class** - Classroom/Venue
- **Beacon** - BLE beacon device
- **ClassBeacon** - Beacon-Class assignment
- **TimetableEntry** - Class schedule
- **SystemSettings** - System configuration
- **AuditLog** - Audit trail

## Development Notes

### Adding New Endpoints

1. Add route function in `app/routes.py`
2. Use `@jwt_required()` decorator for protected routes
3. Use helper functions for common tasks (pagination, logging)
4. Return proper HTTP status codes

### Database Migrations

```powershell
# After modifying models
flask db migrate -m "Description of changes"
flask db upgrade
```

### Testing

```powershell
# Test API endpoints using curl or Postman
# Example login:
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

## Environment Variables

- `FLASK_APP` - Application entry point (run.py)
- `FLASK_ENV` - Environment (development/production)
- `SECRET_KEY` - Flask secret key
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET_KEY` - JWT signing key
- `CORS_ORIGINS` - Allowed CORS origins
- `PORT` - Server port (default: 5000)

## Security Notes

- Always use HTTPS in production
- Never commit `.env` file
- Use strong, random secret keys
- Regularly update dependencies
- Implement rate limiting for production
- Enable SQL query logging in development only
