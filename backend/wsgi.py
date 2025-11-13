import os

# Ensure dotenv is loaded if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

from app import create_app

# Default to production config when running under gunicorn
config_name = os.getenv("FLASK_ENV", "production")
app = create_app(config_name)

# Optional: expose for debug servers like `python wsgi.py`
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
