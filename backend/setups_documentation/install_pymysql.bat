@echo off
echo ========================================
echo UniAttend Backend - PyMySQL Setup
echo (Alternative to mysqlclient)
echo ========================================
echo.

echo Installing PyMySQL...
pip install PyMySQL

echo Installing other dependencies...
pip install Flask==3.0.0
pip install Flask-SQLAlchemy==3.1.1
pip install Flask-JWT-Extended==4.6.0
pip install Flask-CORS==4.0.0
pip install Flask-Migrate==4.0.5
pip install python-dotenv==1.0.0
pip install Werkzeug==3.0.1
pip install SQLAlchemy==2.0.23

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
echo IMPORTANT: Add this to run.py (before create_app):
echo.
echo import pymysql
echo pymysql.install_as_MySQLdb()
echo.
echo Next steps:
echo 1. Create MySQL database: CREATE DATABASE uniattend;
echo 2. Update .env with your MySQL credentials
echo 3. Add PyMySQL import to run.py
echo 4. Run: flask db upgrade
echo 5. Run: python seed.py
echo 6. Run: python run.py
echo.
pause
