import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-hard-to-guess-string'
    FERNET_KEY = os.environ.get('FERNET_KEY')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Logging
    LOG_DIR = os.path.join(basedir, '..', 'logs')
    LOG_FILE = os.path.join(LOG_DIR, 'app.log')
    # Add other configurations here 