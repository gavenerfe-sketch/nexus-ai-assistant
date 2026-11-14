import os
import requests
from dotenv import load_dotenv

load_dotenv()

def generate_ai_response(prompt: str, model: str = "openai/gpt-oss-120b") -> str:
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    
    if not api_key:
        return "Error: GROQ_API_KEY is missing from environment variables."

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    selected_model = model.strip() if model else "openai/gpt-oss-120b"

    payload = {
        "model": selected_model,
        "messages": [{"role": "user", "content": prompt}]
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        if response.status_code == 200:
            data = response.json()
            return data["choices"][0]["message"]["content"]
        else:
            return f"Groq API Error ({response.status_code}): {response.text}"
    except Exception as e:
        return f"Request Exception: {str(e)}"