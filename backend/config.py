"""
Application configuration for GreenGrow Flask API.
"""
import os

# Base directory
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE_DIR = os.path.join(os.path.dirname(BASE_DIR), 'database')

# SQLite database path
DATABASE_PATH = os.path.join(DATABASE_DIR, 'greengrow.db')

# Ensure database directory exists
os.makedirs(DATABASE_DIR, exist_ok=True)

# Flask config
SECRET_KEY = os.environ.get('SECRET_KEY', 'greengrow-dev-secret-key')
DEBUG = True
