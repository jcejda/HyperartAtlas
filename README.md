# HyperartAtlas

A community-driven website for cataloging [Hyperart Thomassons](https://en.wikipedia.org/wiki/Hyperart_Thomasson) — useless architectural relics that have been maintained — around the world.

## Tech Stack

- **Frontend:** React 18, Leaflet, React Router
- **Backend:** FastAPI, SQLAlchemy, Alembic
- **Database:** PostgreSQL (production) / SQLite (local dev)
- **File Storage:** AWS S3 (production) / local filesystem (dev)
- **Auth:** JWT (access + refresh tokens), bcrypt password hashing

## Quick Start (Local Development)

### Prerequisites

- Python 3.10+
- Node.js 18+

### 1. Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env if needed (defaults work for local dev)

# Run the API server
uvicorn app.main:app --reload
```

The API will be at http://localhost:8000 with docs at http://localhost:8000/docs.

### 2. Create Admin User

With the backend running, create your admin account:

```bash
cd backend
source venv/bin/activate
python create_admin.py
```

Or use the one-time setup endpoint (only works when no users exist):

```bash
curl -X POST http://localhost:8000/api/auth/setup-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "username": "admin", "password": "your-password"}'
```

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

The frontend will be at http://localhost:3000 and will proxy API requests to the backend.

## Project Structure

```
HyperartAtlas/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   ├── core/         # Security, dependencies
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # File storage
│   ├── alembic/          # Database migrations
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React contexts
│   │   ├── pages/        # Page components
│   │   └── utils/        # Helpers
│   ├── package.json
│   └── vite.config.js
└── docker-compose.yml
```

## User Roles

- **User** — Can submit Thomasson sightings
- **Moderator** — Can review, edit, approve, or reject submissions
- **Admin** — Full access: moderator permissions + user management

## Deployment

Recommended hosting:

- **Frontend + Backend:** [Render](https://render.com)
- **Database:** [Neon](https://neon.tech) (serverless PostgreSQL)
- **File Storage:** AWS S3

### Environment Variables (Production)

See `backend/.env.example` for the full list. Key ones to set:

- `DATABASE_URL` — PostgreSQL connection string from Neon
- `SECRET_KEY` — Generate with `openssl rand -hex 32`
- `STORAGE_BACKEND=s3` — Use S3 for file storage
- `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` — AWS credentials
- `CORS_ORIGINS` — Your frontend domain (e.g., `https://hyperartatlas.com`)

## License

See [LICENSE](LICENSE) file.
