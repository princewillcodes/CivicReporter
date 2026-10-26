# CivicReporter rebuild foundation

The original citizen app remains at the repository root as a reference. New full-stack work lives under `apps/` and `services/`; do not use the legacy Google Sheets or Google Apps Script integrations in new code.

## Structure

- `apps/web/` — Next.js and TypeScript foundation for future citizen and assembly experiences.
- `services/api/` — Django REST Framework API foundation and database-aware health endpoint.
- `infra/compose.yaml` — optional Docker-based PostgreSQL/PostGIS service for developers who have Docker.
- Root `index.html`, `app.js`, `style.css`, and `data/accra_districts.json` — existing reference app/data, kept in place.

## Prerequisites

- Node.js 20.9 or newer and npm.
- Python 3.11 or newer and pip.
- A local PostgreSQL server if you want PostgreSQL-backed development. The API can also use SQLite for basic checks.

Docker and PostGIS are not required to run this foundation. GeoDjango's native GEOS, PROJ, and GDAL libraries will be needed if a later phase enables Django spatial fields/routing. See the [Django GeoDjango library guide](https://docs.djangoproject.com/en/5.2/ref/contrib/gis/install/geolibs/) for platform instructions.

## Environment setup

Copy `services/api/.env.example` to `services/api/.env` and `apps/web/.env.example` to `apps/web/.env.local`. The API example selects PostgreSQL and contains placeholder credentials, not a usable password. Edit `DATABASE_URL` with the host, port, database name, username, and password shown by your local PostgreSQL app. URL-encode reserved characters in the username or password. Keep the local `.env` private; do not commit it or paste credentials into chat.

The target database must already exist. Create it using your PostgreSQL app's database-management UI if needed; the setup below does not create or alter databases.

## Start the API with your local PostgreSQL app

Start the PostgreSQL server in its Mac app and confirm the target database exists. In one terminal:

```sh
cd services/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # if not already copied, then edit DATABASE_URL
python manage.py runserver 8000
```

The API loads `services/api/.env`. Check `http://127.0.0.1:8000/api/health/`. It executes a read-only `SELECT 1`; a `503` means the API is running but cannot connect to the configured database.

### Check PostGIS availability without changing the database

PostgreSQL can run the current foundation without PostGIS. To see whether the server has PostGIS files available, connect to the same target database using your app's SQL console or `psql`, using the host, port, user, and database from `DATABASE_URL`, then run:

```sql
SELECT name, default_version, installed_version
FROM pg_available_extensions
WHERE name = 'postgis';
```

A returned row means PostGIS is available to that PostgreSQL server. A non-empty `installed_version` means it is already enabled in this database. To confirm the latter directly, run:

```sql
SELECT extname, extversion
FROM pg_extension
WHERE extname = 'postgis';
```

These are read-only checks; do not run `CREATE EXTENSION` for this foundation. If there is no row in `pg_available_extensions`, PostGIS is not available from that server installation. The API still works on ordinary PostgreSQL. Spatial routing will need PostGIS installed and approved for use, or another approved spatial approach, before it is implemented.

### SQLite fallback for basic checks

If PostgreSQL is unavailable, edit `services/api/.env` and set:

```dotenv
DATABASE_URL=sqlite:///local.sqlite3
```

Then run `python manage.py check` or start the API as above. Django uses the local `local.sqlite3` file for basic development checks. Change `DATABASE_URL` back to your PostgreSQL URL when you want to use the Mac app server.

## Optional Docker database

Developers with Docker may use the included PostGIS service instead of a locally installed PostgreSQL app. Copy `infra/.env.example` to `infra/.env`, then run from the repository root:

```sh
docker compose --env-file infra/.env -f infra/compose.yaml up -d db
```

Set the API `DATABASE_URL` to match the Compose host port, database, username, and password. No application tables or migrations are included.

## Start the web app

In another terminal:

```sh
cd apps/web
npm install
cp .env.example .env.local  # if not already copied
npm run dev
```

Open `http://localhost:3000`. The web scaffold defines `NEXT_PUBLIC_API_BASE_URL` for future API requests; the landing page does not yet call the API.

## Current scope

This is a foundation only: no authentication, reports, user or assembly models, jurisdiction routing, status workflow, maps, analytics, photo upload/storage, CSV import, or production deployment configuration. The health endpoint checks database connectivity without creating schema objects.
