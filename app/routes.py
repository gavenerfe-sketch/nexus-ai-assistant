from flask import Blueprint, jsonify, request, render_template
from app.router import generate_ai_response
from app.logger import log_chat

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def home():
    # Renders index.html from templates folder
    return render_template('index.html')

@main_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    
    if not data or 'prompt' not in data:
        return jsonify({"error": "Missing 'prompt' in request body"}), 400
    
    user_prompt = data['prompt']
    # Safely default to a Groq model if 'model' key is missing or empty
    model_name = data.get('model') or 'groq/openai/gpt-oss-120b'
    
    # Generate AI response via LiteLLM router
    ai_response = generate_ai_response(user_prompt, model=model_name)
    
    # Log the interaction into PostgreSQL
    log_chat(user_prompt, ai_response)
    
    return jsonify({
        "prompt": user_prompt,
        "response": ai_response,
        "model": model_name
    })