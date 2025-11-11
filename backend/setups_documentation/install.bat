@echo off
echo ========================================
echo UniAttend Backend - MySQL Setup
echo ========================================
echo.

echo Step 1: Installing dependencies...
echo.

REM Try to install mysqlclient
pip install mysqlclient

REM Check if installation was successful
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo mysqlclient installation failed!
    echo ========================================
    echo.
    echo Option 1: Install Visual Studio Build Tools
    echo   Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
    echo.
    echo Option 2: Use PyMySQL (simpler alternative)
    echo   Run: pip install PyMySQL
    echo   Then add this to run.py before create_app():
    echo   import pymysql
    echo   pymysql.install_as_MySQLdb()
    echo.
    echo Option 3: Download pre-built wheel
    echo   Visit: https://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient
    echo   Download appropriate .whl file
    echo   Install with: pip install downloaded_file.whl
    echo.
    pause
    exit /b 1
)

echo.
echo Step 2: Installing other dependencies...
pip install -r requirements.txt

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
echo Next steps:
echo 1. Create MySQL database: CREATE DATABASE uniattend;
echo 2. Update .env with your MySQL credentials
echo 3. Run: flask db upgrade
echo 4. Run: python seed.py
echo 5. Run: python run.py
echo.
pause
