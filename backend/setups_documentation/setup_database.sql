-- MySQL Setup Script for UniAttend
-- Run this script in MySQL command line or MySQL Workbench

-- Create database
CREATE DATABASE IF NOT EXISTS uniattend 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Select database
USE uniattend;

-- Create dedicated user (optional but recommended)
-- Replace 'your_password' with a strong password
CREATE USER IF NOT EXISTS 'uniattend_user'@'localhost' IDENTIFIED BY 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON uniattend.* TO 'uniattend_user'@'localhost';

-- Apply privileges
FLUSH PRIVILEGES;

-- Verify database was created
SHOW DATABASES LIKE 'uniattend';

-- Show character set
SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME 
FROM INFORMATION_SCHEMA.SCHEMATA 
WHERE SCHEMA_NAME = 'uniattend';

-- Done!
SELECT 'Database setup complete!' as Status;
SELECT 'Next steps:' as Info;
SELECT '1. Update .env with database credentials' as Step1;
SELECT '2. Run: pip install -r requirements.txt' as Step2;
SELECT '3. Run: flask db upgrade' as Step3;
SELECT '4. Run: python seed.py' as Step4;
SELECT '5. Run: python run.py' as Step5;
