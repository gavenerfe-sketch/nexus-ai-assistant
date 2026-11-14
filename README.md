# Nexus AI Assistant

Nexus is a Flask-based AI assistant with a minimalist browser chat interface. It supports multiple model providers, local conversation history, Markdown/code rendering, and a responsive light/dark user interface.

## Features

- Browser-based chat interface served by Flask
- Model selection between Groq-hosted GPT-OSS and Google Gemini Flash
- Conversation history stored locally in the browser with `localStorage`
- Search, switch, create, and delete conversations
- Markdown rendering and syntax highlighting
- Light and dark themes
- Word and estimated-token counter
- Optional PostgreSQL chat logging components
- PyInstaller specifications for building a standalone Windows executable

### Browser automation

Chrome and Edge browser automation is a planned extension and is not currently implemented in this repository. When added, it should be isolated behind a dedicated automation service and configured with explicit browser permissions and environment variables.

## Tech stack

- **Backend:** Python, Flask
- **AI providers:** Groq API and Google Gemini API
- **Frontend:** HTML, CSS, vanilla JavaScript
- **Rendering:** Marked and Highlight.js via CDN
- **Configuration:** `python-dotenv`
- **Optional persistence:** PostgreSQL-compatible database configuration
- **Packaging:** PyInstaller

## Project structure

```text
.
├── app/
│   ├── __init__.py          # Flask application factory and chat API
│   ├── router.py            # Groq HTTP client helper
│   ├── routes.py            # Additional route blueprint
│   ├── database.py          # Database utility
│   ├── logger.py             # Chat logging helper
│   ├── models.py             # Database models
│   ├── templates/index.html  # Chat interface
│   └── static/               # JavaScript, CSS, and favicon
├── .env.example              # Safe configuration template
├── requirements.txt          # Python dependencies
├── run.py                    # Development entry point
└── Nexus.spec                # PyInstaller build specification
```

## Requirements

- Python 3.10 or newer
- API credentials for the providers you intend to use
- Optional: PostgreSQL and a valid SQLAlchemy database URL

## Setup

1. Clone the repository and enter its directory:

   ```powershell
   git clone https://github.com/<your-account>/<your-repository>.git
   cd <your-repository>
   ```

2. Create and activate a virtual environment:

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

   On macOS/Linux:

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Create your local environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

5. Edit `.env` and add your provider credentials. Never commit this file.

6. Start the application:

   ```bash
   python run.py
   ```

7. Open <http://127.0.0.1:5000> in a browser.

## Environment variables

The application reads configuration from a local `.env` file or the process environment. Use `.env.example` as the template.

| Variable | Required | Description |
| --- | --- | --- |
| `GROQ_API_KEY` | For Groq | API key used by the Groq client and Groq router helper. |
| `GEMINI_API_KEY` | For Gemini | API key used by the Google Gemini client. |
| `OPENAI_API_KEY` | No | Reserved for future OpenAI-compatible integrations. |
| `DATABASE_URL` | Optional | PostgreSQL-compatible connection URL for database-backed logging. |

Only configure the providers you use. Keep credentials out of source code, screenshots, logs, and version control. If a credential has ever been committed or exposed, revoke and rotate it before continuing.

## Development notes

- The main application is created in `app/__init__.py`.
- The frontend stores conversation history and theme preferences in browser `localStorage`.
- The application currently exposes the primary chat endpoint at `POST /api/chat`.
- The separate router helper uses the Groq OpenAI-compatible endpoint.
- Do not use production API keys for local experimentation.

## Build a standalone executable

The repository includes a PyInstaller specification for the Nexus application. After installing PyInstaller, build with:

```bash
pyinstaller Nexus.spec
```

The generated files are placed in `build/` and `dist/`; these directories are ignored by Git.

## Security

- Keep `.env` private; only commit `.env.example` with placeholder values.
- Rotate any API key or database password that was previously exposed.
- Review third-party CDN dependencies before deploying to production.
- Add authentication, rate limiting, input validation, and secure error handling before exposing the service publicly.

## License

No license has been specified yet. Add a license file before distributing the project.
