# Load environment variables first
import os
from dotenv import load_dotenv
load_dotenv()

# Use PyMySQL as MySQL driver (required for Aiven connection)
import pymysql
pymysql.install_as_MySQLdb()

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from config import config

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()


def create_app(config_name='default'):
    """Application factory"""
    app = Flask(__name__, instance_relative_config=True)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    
    # JWT error handlers
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        print(f"⚠ Invalid token error: {error}")
        return {'message': 'Invalid token - please login again', 'error': str(error)}, 422
    
    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        print(f"⚠ Unauthorized error: {error}")
        return {'message': 'Missing authorization token', 'error': str(error)}, 401
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        print(f"⚠ Expired token: {jwt_data}")
        return {'message': 'Token has expired - please login again', 'error': 'Token expired'}, 401
    
    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_data):
        print(f"⚠ Revoked token: {jwt_data}")
        return {'message': 'Token has been revoked', 'error': 'Token revoked'}, 401
    
    @jwt.token_verification_failed_loader
    def token_verification_failed_callback(jwt_header, jwt_data):
        print(f"⚠ Token verification failed: {jwt_header}, {jwt_data}")
        return {'message': 'Token verification failed', 'error': 'Verification failed'}, 422
    
    # Configure CORS
    CORS(app, 
         resources={r"/api/*": {"origins": app.config['CORS_ORIGINS']}},
         supports_credentials=True)
    
    # Register blueprints
    from app.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Create upload folder if it doesn't exist
    import os
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'UniAttend API is running'}, 200
    
    # Root endpoint
    @app.route('/')
    def index():
        return {
            'message': 'Welcome to UniAttend API',
            'version': '1.0.0',
            'endpoints': {
                'health': '/health',
                'api': '/api',
                'admin': '/api/admin',
            }
        }, 200
    
    return app
