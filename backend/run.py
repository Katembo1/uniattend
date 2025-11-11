import os
from dotenv import load_dotenv

# Use PyMySQL as MySQL driver (required for Aiven connection)
import pymysql
pymysql.install_as_MySQLdb()

from app import create_app, db

# Load environment variables from .env file
load_dotenv()

# Create Flask application
app = create_app(os.getenv('FLASK_ENV', 'development'))

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
