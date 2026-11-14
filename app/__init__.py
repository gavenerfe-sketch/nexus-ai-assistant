import os
import sys
from flask import Flask, render_template, request, jsonify
from groq import Groq
from google import genai
from dotenv import load_dotenv

load_dotenv()

def create_app():
    # Fix paths for PyInstaller bundle execution
    if getattr(sys, 'frozen', False):
        template_folder = os.path.join(sys._MEIPASS, 'templates')
        static_folder = os.path.join(sys._MEIPASS, 'static')
        app = Flask(__name__, template_folder=template_folder, static_folder=static_folder)
    else:
        app = Flask(__name__)

    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

    groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    gemini_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

    SYSTEM_INSTRUCTION = (
        "You are Nexus, an intelligent, sleek, and minimalist local AI assistant. "
        "If asked who created, made, or built you, you must state: 'My creator is Gad Known as Axl.' "
        "Do NOT state that you were created by OpenAI, Google, Groq, or Meta. "
        "CRITICAL RULE: Never include emojis, wave icons, or decorative symbols in your output."
    )

    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/api/chat', methods=['POST'])
    def chat():
        data = request.get_json()
        incoming_messages = data.get('messages', [])
        raw_model = data.get('model', 'groq-20b')

        if not incoming_messages:
            return jsonify({"error": "Messages are required"}), 400

        try:
            ai_response = ""

            if 'gemini' in raw_model.lower():
                contents = []
                for msg in incoming_messages:
                    role = "user" if msg['role'] == "user" else "model"
                    contents.append({"role": role, "parts": [{"text": msg['content']}]})

                response = gemini_client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=contents,
                    config={
                        "system_instruction": SYSTEM_INSTRUCTION
                    }
                )
                ai_response = response.text
            else:
                formatted_messages = [
                    {"role": "system", "content": SYSTEM_INSTRUCTION}
                ] + incoming_messages

                completion = groq_client.chat.completions.create(
                    model='openai/gpt-oss-20b',
                    messages=formatted_messages,
                    temperature=0.7,
                    max_tokens=2048
                )
                ai_response = completion.choices[0].message.content

            return jsonify({"response": ai_response})

        except Exception as e:
            return jsonify({"response": f"Backend Error: {str(e)}"}), 500

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)