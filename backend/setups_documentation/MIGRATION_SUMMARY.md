# Database Migration Summary: PostgreSQL → MySQL

## Changes Made

### 1. Dependencies Updated (`requirements.txt`)
**Before:**
- `psycopg2-binary` (PostgreSQL driver)

**After:**
- `mysqlclient==2.2.0` (MySQL driver)
- All versions pinned for stability

**Alternative:** PyMySQL (easier to install on Windows)

### 2. Configuration Updated (`config.py`)
**Before:**
```python
SQLALCHEMY_DATABASE_URI = 'sqlite:///...'
```

**After:**
```python
# MySQL configuration with environment variables
MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
MYSQL_PORT = os.environ.get('MYSQL_PORT', '3306')
MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE', 'uniattend')

SQLALCHEMY_DATABASE_URI = f'mysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4'
```

### 3. Environment Variables Updated (`.env`)
Added MySQL-specific variables:
```properties
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=uniattend
```

### 4. New Files Created
1. **MYSQL_SETUP.md** - Detailed MySQL setup guide
2. **install.bat** - Automated installation script for Windows
3. **install_pymysql.bat** - Alternative installation using PyMySQL
4. **.env.example** - Template with MySQL configuration

### 5. Documentation Updated
- **README.md** - Updated with MySQL setup instructions
- Added database creation step
- Added seed data information

## Installation Options

### Option 1: mysqlclient (Recommended but harder to install)
```bash
pip install mysqlclient
```
**Pros:** Official MySQL Python connector, better performance
**Cons:** Requires C compiler on Windows

### Option 2: PyMySQL (Easier on Windows)
```bash
pip install PyMySQL
```
Then uncomment in `run.py`:
```python
import pymysql
pymysql.install_as_MySQLdb()
```
**Pros:** Pure Python, easy to install
**Cons:** Slightly slower performance

## Setup Steps

1. **Install MySQL Server** (if not already installed)
2. **Create Database:**
   ```sql
   CREATE DATABASE uniattend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. **Update `.env`** with your MySQL credentials
4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
5. **Run migrations:**
   ```bash
   flask db upgrade
   ```
6. **Seed database:**
   ```bash
   python seed.py
   ```
7. **Start server:**
   ```bash
   python run.py
   ```

## Connection String Format

```
mysql://username:password@host:port/database?charset=utf8mb4
```

Example:
```
mysql://root:password123@localhost:3306/uniattend?charset=utf8mb4
```

## Troubleshooting

### mysqlclient installation fails on Windows:
1. Install Visual Studio Build Tools
2. Or use PyMySQL alternative
3. Or download pre-built wheel from https://www.lfd.uci.edu/~gohlke/pythonlibs/

### Can't connect to MySQL:
- Check MySQL service is running
- Verify credentials in `.env`
- Ensure database exists
- Check firewall settings

### Character encoding issues:
- Database uses `utf8mb4` for full Unicode support
- Connection string includes `?charset=utf8mb4`

## Migration from SQLite (if applicable)

If you were using SQLite:
1. Export data if needed
2. Update `.env` with MySQL settings
3. Delete `instance/` folder
4. Delete `migrations/versions/` folder contents
5. Run `flask db migrate` to create new migrations
6. Run `flask db upgrade`
7. Run `python seed.py` to populate database

## Key Differences: PostgreSQL vs MySQL

1. **Connection String:**
   - PostgreSQL: `postgresql://user:pass@host/db`
   - MySQL: `mysql://user:pass@host/db`

2. **Driver:**
   - PostgreSQL: `psycopg2`
   - MySQL: `mysqlclient` or `PyMySQL`

3. **Character Set:**
   - MySQL requires explicit `?charset=utf8mb4`
   - Supports full Unicode including emojis

4. **Boolean Fields:**
   - SQLAlchemy handles differences automatically
   - MySQL uses TINYINT(1) for Boolean

## Benefits of MySQL

- ✅ Wide compatibility with hosting providers
- ✅ Easy to install (XAMPP, WAMP include it)
- ✅ Good performance for web applications
- ✅ Large community support
- ✅ Free and open-source

## Notes

- All database models remain unchanged (SQLAlchemy abstracts differences)
- Migrations work the same way
- API endpoints unchanged
- Frontend requires no modifications
- Performance characteristics similar for this application size
