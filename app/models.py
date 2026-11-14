from app import db
from datetime import datetime

class ChatLog(db.Model):
    __tablename__ = 'chat_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_prompt = db.Column(db.Text, nullable=False)
    ai_response = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<ChatLog {self.id}>"