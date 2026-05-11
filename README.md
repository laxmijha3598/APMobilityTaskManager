# Task Management Web App (MERN)

A responsive Task Management web application built with the **MERN stack**:
- **Frontend**: React
- **Backend**: Node.js + Express
- **Database**: MongoDB

## Features
- Add a new task
- Edit and delete tasks
- Mark tasks as completed / uncompleted
- View all tasks in a clean, responsive UI
- Fetch and store data using REST APIs
- User Registration / Login / Logout (JWT auth)

## Tech Stack
- Backend: Express, Mongoose, CORS, dotenv
- Frontend: React, Vite, axios

## Folder Structure
```
backend/        # Express API + MongoDB models
frontend/       # React app (Vite)
```

## Setup Instructions

### 1) Prerequisites
- Node.js 18+ recommended
- MongoDB running locally or MongoDB Atlas connection string

### 2) Backend setup
```bash
cd backend
npm install
cp .env.example .env
```

Update `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/task_manager
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=replace_with_a_long_random_secret
```

Run the API:
```bash
npm run dev
```

API runs at `http://localhost:5000`.

### 3) Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
```

Update `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

Run the UI:
```bash
npm run dev
```

Open `http://localhost:5173`.

## API Endpoints
Auth:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (requires `Authorization: Bearer <token>`)

Tasks (requires `Authorization: Bearer <token>`):
- `GET /api/tasks` - list tasks (newest first)
- `POST /api/tasks` - create task
- `PATCH /api/tasks/:id` - update title/description/completed
- `DELETE /api/tasks/:id` - delete task

### Task shape
```json
{
  "_id": "…",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "createdAt": "…",
  "updatedAt": "…"
}
```

## Assumptions
- JWT authentication is used (no refresh tokens) for simplicity.
- Minimal required fields: `title` is required; `description` optional.

## Additional Notes / Extras
- Basic validation and consistent API error responses.
- Responsive layout optimized for mobile and desktop.

