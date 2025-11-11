# 🚀 Quick Start Guide - MySQL Setup

## Prerequisites
- ✅ MySQL Server installed
- ✅ Python 3.8+ installed
- ✅ pip package manager

## 5-Minute Setup

### 1️⃣ Create Database (2 minutes)
```bash
# Open MySQL command line
mysql -u root -p

# Run this SQL
CREATE DATABASE uniattend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

Or run the SQL script:
```bash
mysql -u root -p < setup_database.sql
```

### 2️⃣ Configure Environment (30 seconds)
Edit `.env` file:
```properties
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=uniattend
```

### 3️⃣ Install Dependencies (2 minutes)
**Windows - Easy Way (PyMySQL):**
```bash
pip install PyMySQL
pip install -r requirements.txt
```
Then uncomment in `run.py`:
```python
import pymysql
pymysql.install_as_MySQLdb()
```

**Windows - Proper Way (mysqlclient):**
```bash
# Download wheel from: https://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient
pip install mysqlclient‑2.2.0‑cp311‑cp311‑win_amd64.whl
pip install -r requirements.txt
```

**Linux/Mac:**
```bash
pip install -r requirements.txt
```

### 4️⃣ Initialize Database (30 seconds)
```bash
flask db upgrade
python seed.py
```

### 5️⃣ Run! (5 seconds)
```bash
python run.py
```

Visit: http://localhost:5000/health

## Default Login
- **Email:** admin@uniattend.com
- **Password:** admin123

## Troubleshooting

| Problem | Solution |
|---------|----------|
| ❌ Can't install mysqlclient | Use PyMySQL instead (see step 3) |
| ❌ Can't connect to MySQL | Check MySQL is running: `mysql -u root -p` |
| ❌ Database doesn't exist | Run: `CREATE DATABASE uniattend;` |
| ❌ Access denied | Update MYSQL_PASSWORD in `.env` |
| ❌ Port 3306 in use | Check MYSQL_PORT in `.env` |

## Quick Commands

```bash
# Check MySQL is running
mysql --version

# Connect to MySQL
mysql -u root -p

# Show databases
SHOW DATABASES;

# Use database
USE uniattend;

# Show tables
SHOW TABLES;

# Drop and recreate database (⚠️ deletes all data)
DROP DATABASE uniattend;
CREATE DATABASE uniattend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Files Changed
- ✅ `requirements.txt` - Updated to use mysqlclient
- ✅ `config.py` - MySQL connection configuration
- ✅ `.env` - MySQL credentials
- ✅ `run.py` - PyMySQL support (commented)

## Need Help?
1. See `MYSQL_SETUP.md` for detailed instructions
2. See `MIGRATION_SUMMARY.md` for technical details
3. Run `install.bat` (Windows) for automated setup
4. Run `install_pymysql.bat` for PyMySQL setup

## Connection String
```
mysql://root:password@localhost:3306/uniattend?charset=utf8mb4
       ^^^^  ^^^^^^^^  ^^^^^^^^^  ^^^^  ^^^^^^^^^
       user  password    host     port  database
```

## Success Checklist
- [ ] MySQL installed and running
- [ ] Database `uniattend` created
- [ ] `.env` configured with credentials
- [ ] Dependencies installed
- [ ] Migrations applied
- [ ] Database seeded
- [ ] Backend running on port 5000
- [ ] Can access http://localhost:5000/health
- [ ] Can login with admin@uniattend.com

**Total Time: ~5-10 minutes** ⚡
