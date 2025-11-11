import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Use PyMySQL
import pymysql
pymysql.install_as_MySQLdb()

from app import create_app
from flask_jwt_extended import create_access_token

app = create_app()

with app.app_context():
    # Test JWT creation
    test_token = create_access_token(identity=1)
    print('✅ JWT Configuration Test')
    print('=' * 50)
    print(f'JWT_SECRET_KEY configured: {app.config.get("JWT_SECRET_KEY")[:20]}...')
    print(f'Token created successfully: {test_token[:50]}...')
    print('=' * 50)
    print('✓ JWT is working correctly!')
