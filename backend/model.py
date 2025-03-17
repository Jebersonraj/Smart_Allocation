# backend/model.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Faculty(db.Model):
    __tablename__ = 'faculty'
    faculty_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    mobile_number = db.Column(db.String(15), unique=True)
    email_id = db.Column(db.String(255), unique=True)
    is_admin = db.Column(db.Boolean, default=False)
    attendances = db.relationship('Attendance', backref='faculty', lazy=True)
    allocations = db.relationship('VenueAllocation', backref='faculty', lazy=True)

class Attendance(db.Model):
    __tablename__ = 'attendance'
    id = db.Column(db.Integer, primary_key=True)
    faculty_id = db.Column(db.Integer, db.ForeignKey('faculty.faculty_id'))
    date = db.Column(db.Date)
    is_present = db.Column(db.Boolean, default=False)

class Venue(db.Model):
    __tablename__ = 'venues'
    venue_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    allocations = db.relationship('VenueAllocation', backref='venue', lazy=True)

class VenueAllocation(db.Model):
    __tablename__ = 'venue_allocations'
    allocation_id = db.Column(db.Integer, primary_key=True)
    faculty_id = db.Column(db.Integer, db.ForeignKey('faculty.faculty_id'), nullable=False)
    venue_id = db.Column(db.Integer, db.ForeignKey('venues.venue_id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time_slot = db.Column(db.Enum('08:00-12:00', '12:00-15:00'), nullable=False)