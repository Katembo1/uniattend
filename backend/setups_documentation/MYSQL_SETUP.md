# MySQL Setup Instructions for UniAttend

## Prerequisites

1. **Install MySQL Server**
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP/WAMP which includes MySQL

2. **Install MySQL Client (for Python)**
   - Windows: Download from https://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient
   - Or use pip (may require Visual Studio Build Tools)

## Step 1: Create MySQL Database

Open MySQL command line or MySQL Workbench and run:

```sql
CREATE DATABASE uniattend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Optionally, create a dedicated user:

```sql
CREATE USER 'uniattend_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON uniattend.* TO 'uniattend_user'@'localhost';
FLUSH PRIVILEGES;
```

## Step 2: Configure Environment Variables

Copy `.env.example` to `.env` and update with your MySQL credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```properties
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=uniattend
```

## Step 3: Install Python Dependencies

```bash
pip install -r requirements.txt
```

**Note for Windows users:** If `mysqlclient` installation fails:

1. Download the wheel file from: https://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient
2. Choose the correct version (e.g., `mysqlclient‑2.2.0‑cp311‑cp311‑win_amd64.whl` for Python 3.11)
3. Install: `pip install mysqlclient‑2.2.0‑cp311‑cp311‑win_amd64.whl`

**Alternative:** Use `PyMySQL` instead:
```bash
pip uninstall mysqlclient
pip install PyMySQL
```

Then add to your code before creating the app:
```python
import pymysql
pymysql.install_as_MySQLdb()
```

## Step 4: Initialize Database

```bash
# Initialize migrations
flask db init

# Create migration
flask db migrate -m "Initial migration"

# Apply migration
flask db upgrade
```

Or run directly:
```bash
python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
...     db.create_all()
```

## Step 5: Seed Database

```bash
python seed.py
```

## Step 6: Run the Application

```bash
python run.py
```

The backend should now be running on http://127.0.0.1:5000

## Troubleshooting

### Error: "Can't connect to MySQL server"
- Ensure MySQL service is running
- Check host, port, username, and password in `.env`

### Error: "Access denied for user"
- Verify MySQL credentials
- Check user has proper permissions on the database

### Error: "Unknown database 'uniattend'"
- Create the database first (see Step 1)

### Error: "mysqlclient installation failed"
- Install Visual Studio Build Tools, or
- Use the wheel file method, or
- Use PyMySQL as alternative

## Connection String Format

The connection string format is:
```
mysql://username:password@host:port/database?charset=utf8mb4
```

Example:
```
mysql://root:mypassword@localhost:3306/uniattend?charset=utf8mb4
```

## Migration from SQLite

If you're migrating from SQLite:

1. Export data from SQLite (if needed)
2. Create MySQL database
3. Update `.env` with MySQL credentials
4. Run migrations
5. Import data or run seed script
