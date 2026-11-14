from app import db
from app.models import ChatLog

def log_chat(prompt: str, response: str):
    try:
        entry = ChatLog(user_prompt=prompt, ai_response=response)
        db.session.add(entry)
        db.session.commit()
        return entry
    except Exception as e:
        db.session.rollback()
        print(f"Failed to log chat: {e}")
        return None
  