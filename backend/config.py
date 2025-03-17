import os
from dotenv import load_dotenv
import urllib.parse

load_dotenv()

password = urllib.parse.quote("Jeber@16")  # Encodes '@' as '%40'
DATABASE_URL = f"mysql+pymysql://root:{password}@localhost/venue_allotment"

class Config:
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'ca27a703e17851f96413aad251cc27244e7ba7af8df4a72b205b9722d17705e2')