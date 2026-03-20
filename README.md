# Store Rating App

![Project Architecture](frontend/public/architecture.png)

## Tech Stack
- Backend: NestJS
- Database: PostgreSQL
- Frontend: ReactJS

## Project Structure
```text
store-rating-app/
	backend/
		src/
			admin/
			auth/
			ratings/
			stores/
			users/
		.env.example
		package.json
	frontend/
		public/
			architecture.png
		src/
			components/
			pages/
		.env.example
		package.json
	README.md
```

## Live Demo
- Frontend URL: Add your deployed frontend URL here
- Backend API URL: Add your deployed backend URL here

## Setup Instructions

### Backend
```bash
cd backend
npm install
# Copy env template and fill credentials
cp .env.example .env
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
# Copy env template
cp .env.example .env
npm run dev
```

## Environment Variables

### Backend env (backend/.env)
- DB_HOST: PostgreSQL host
- DB_PORT: PostgreSQL port
- DB_USERNAME: PostgreSQL username
- DB_PASSWORD: PostgreSQL password
- DB_NAME: PostgreSQL database name
- JWT_SECRET: secret for signing JWT tokens
- JWT_EXPIRES_IN: token expiry (example: 1d)

### Frontend env (frontend/.env)
- VITE_API_URL: backend base URL (example: http://localhost:3001)

## Default Admin Login
- Email: admin@store.com
- Password: Admin@123

## Features
- Role based login (Admin, User, Store Owner)
- Admin dashboard with stats, user and store management
- Normal user can browse and rate stores
- Store owner can view ratings dashboard
