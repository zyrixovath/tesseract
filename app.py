from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import random
import os

app = Flask(__name__)
CORS(app)

# This looks for your Supabase URL in Render's settings. 
# If it can't find it (like on your local computer), it safely falls back to SQLite.
db_url = os.environ.get('DATABASE_URL', 'sqlite:///campuspulse.db')
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Complaint(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.String(20), unique=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(20), default='low')
    status = db.Column(db.String(50), default='Submitted')
    reported_by = db.Column(db.String(100), nullable=False)
    upvotes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()

@app.route('/api/complaints', methods=['GET'])
def get_complaints():
    complaints = Complaint.query.order_by(Complaint.created_at.desc()).all()
    return jsonify([{
        'id': c.complaint_id,
        'title': c.title,
        'category': c.category,
        'location': c.location,
        'description': c.description,
        'severity': c.severity,
        'status': c.status,
        'reportedBy': c.reported_by,
        'upvotes': c.upvotes,
        'createdAt': c.created_at.isoformat()
    } for c in complaints])

@app.route('/api/complaints', methods=['POST'])
def create_complaint():
    data = request.json
    new_id = f"CP-{str(datetime.now().year)[-2:]}-{random.randint(1000, 9999)}"
    
    new_complaint = Complaint(
        complaint_id=new_id,
        title=data.get('title', f"{data['category']} issue at {data['location']}"),
        category=data['category'],
        location=data['location'],
        description=data['description'],
        severity=data.get('severity', 'low'),
        reported_by=data.get('reportedBy', 'anonymous')
    )
    db.session.add(new_complaint)
    db.session.commit()
    
    return jsonify({"message": "Success", "id": new_id}), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)
