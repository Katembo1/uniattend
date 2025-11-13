# Docker setup for UniAttend

This repo includes Docker configurations to run the backend (Flask) and frontend (React) locally, and to build/push images to a registry.

## Prerequisites

- Docker Desktop installed and running
- Optional: Docker Hub account for pushing images

## Local development with Compose

From the repository root:

```powershell
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f --tail=100

# Stop
docker compose down
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MySQL: localhost:3306 (user: uniuser / pass: unipassword)

Notes:
- Frontend is built with REACT_APP_API_URL=http://localhost:5000/api.
- Backend CORS allows http://localhost:3000 by default in compose.
- Backend uses the internal MySQL container by default. You can override using `DATABASE_URL` or `MYSQL_*` envs in `docker-compose.yml`.

## Build images without Compose

```powershell
# Backend
docker build -t uniattend-backend:local ./backend

# Frontend
docker build -t uniattend-frontend:local --build-arg REACT_APP_API_URL=http://localhost:5000/api ./frontend
```

## Push to Docker Hub

Replace `<username>` with your Docker Hub username.

```powershell
# Tag
$tag = "latest"; docker tag uniattend-backend:local <username>/uniattend-backend:$tag; docker tag uniattend-frontend:local <username>/uniattend-frontend:$tag

# Login (one-time per machine)
docker login

# Push
docker push <username>/uniattend-backend:$tag; docker push <username>/uniattend-frontend:$tag
```

## GitHub Actions (optional CI)

A workflow file is included under `.github/workflows/docker.yml` that builds and pushes images on every push to `main`. To enable:

1. Create two GitHub repository secrets:
   - `DOCKERHUB_USERNAME` – your Docker Hub username
   - `DOCKERHUB_TOKEN` – a Personal Access Token or password
2. Push to `main` and check the Actions tab.

Images will be pushed as:
- `<DOCKERHUB_USERNAME>/uniattend-backend:latest` and `:<git-sha>`
- `<DOCKERHUB_USERNAME>/uniattend-frontend:latest` and `:<git-sha>`

## Troubleshooting

- If MySQL migrations are required, run them inside the backend container using Flask-Migrate.
- If you change API URL or CORS, update `docker-compose.yml` and rebuild.
- If you see module build errors for `mysqlclient`, the Dockerfile uses manylinux wheels. If needed, add system build tools to the backend image (gcc and libmysqlclient-dev).