# CivicReporter backend

This directory contains the initial Django and Django REST Framework scaffold for CivicReporter. It currently provides project configuration and empty application boundaries only. Models, API endpoints, PostgreSQL, frontend integration, and boundary-data imports are intentionally deferred.

## Applications

- `accounts` — user identity and authentication
- `assemblies` — municipalities and responsible assemblies
- `reports` — civic issue reporting and status tracking
- `notifications` — report and community updates
- `community` — municipality-based conversations

## Local setup

From the `backend/` directory:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
```

Generate a development secret key:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Replace `DJANGO_SECRET_KEY` in `.env` with that generated value. The default example configuration uses SQLite and requires no external database service.

Start Django:

```bash
python manage.py runserver
```

The development server will be available at `http://127.0.0.1:8000/`. The app URL namespaces are mounted under `/api/accounts/`, `/api/assemblies/`, `/api/reports/`, `/api/notifications/`, and `/api/community/`; they intentionally contain no endpoints yet.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DJANGO_SECRET_KEY` | Required Django signing secret |
| `DJANGO_DEBUG` | Enables development debug mode when set to `True` |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated host names accepted by Django |
| `DB_ENGINE` | Django database backend; currently SQLite |
| `DB_NAME` | SQLite filename or future database name |
| `DB_USER` | Reserved for future PostgreSQL configuration |
| `DB_PASSWORD` | Reserved for future PostgreSQL configuration |
| `DB_HOST` | Reserved for future PostgreSQL configuration |
| `DB_PORT` | Reserved for future PostgreSQL configuration |

Do not commit `.env`, local SQLite databases, or the `.venv/` directory.
