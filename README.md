# Sunday - Job Search Tracker

A modern, production-ready project management application inspired by Monday.com, specifically designed for tracking job search applications. Built with **NestJS**, **React**, **TypeScript**, and **PostgreSQL**, fully containerized with **Docker**.

![Sunday App](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## Features

- 📊 **Board-based Interface** - Organize job applications in customizable boards
- 🎨 **Premium Dark Theme** - Beautiful UI with vibrant gradients and smooth animations
- 📝 **10 Pre-configured Columns** - Job title, company, status, dates, priority, salary, links, and more
- ✏️ **Inline Editing** - Click any cell to edit instantly
- 🎯 **Status Tracking** - Visual pipeline from "Applied" to "Offer" to "Accepted"
- 🗂️ **Group Organization** - Organize applications into groups (Active, Follow Up, Closed)
- 🔄 **Real-time Updates** - Changes reflect immediately across the board
- 🐳 **Fully Dockerized** - One command to run the entire stack

## Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **TypeORM** - Database ORM with entity relationships
- **PostgreSQL** - Robust relational database
- **Class Validator** - DTO validation

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type safety throughout
- **Vite** - Lightning-fast build tool
- **TanStack Query** - Powerful data fetching
- **Axios** - HTTP client

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Production web server

## Quick Start

### Prerequisites

- Docker Desktop installed
- Docker Compose installed

### Running with Docker (Recommended)

1. **Clone the repository** (or use your existing directory)

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000

The application will automatically seed a job search board with sample data on first launch.

### Local Development

#### Backend

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials.

3. **Start PostgreSQL:**
   ```bash
   docker run -d \
     --name sunday-postgres \
     -e POSTGRES_USER=sunday \
     -e POSTGRES_PASSWORD=sunday123 \
     -e POSTGRES_DB=sunday_db \
     -p 5432:5432 \
     postgres:15-alpine
   ```

4. **Run the backend:**
   ```bash
   npm run start:dev
   ```

5. **Seed the database:**
   ```bash
   curl -X POST http://localhost:3000/boards/seed
   ```

#### Frontend

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the app:**
   Open http://localhost:5173

## API Endpoints

### Boards
- `GET /boards` - List all boards
- `GET /boards/:id` - Get board with all data
- `POST /boards` - Create new board
- `POST /boards/seed` - Seed job search board
- `PATCH /boards/:id` - Update board
- `DELETE /boards/:id` - Delete board

### Items (Job Applications)
- `POST /items` - Create new item
- `PATCH /items/:id` - Update item
- `PATCH /items/:id/position` - Update position (drag-drop)
- `DELETE /items/:id` - Delete item

### Cells
- `PATCH /cells/:itemId/:columnId` - Update cell value

## Project Structure

```
sunday/
├── src/                    # Backend source code
│   ├── entities/          # TypeORM entities
│   ├── boards/            # Boards module
│   ├── items/             # Items module
│   ├── cells/             # Cells module
│   ├── app.module.ts      # Root module
│   └── main.ts            # Entry point
├── client/                # Frontend source code
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── api/          # API client
│   │   ├── types/        # TypeScript types
│   │   └── styles/       # CSS styles
│   ├── Dockerfile        # Frontend Docker config
│   └── nginx.conf        # Nginx configuration
├── Dockerfile            # Backend Docker config
├── docker-compose.yml    # Multi-container setup
└── README.md            # This file
```

## Database Schema

- **boards** - Project boards
- **groups** - Sections within boards (Active, Follow Up, Closed)
- **columns** - Column definitions (type, label, settings)
- **items** - Individual job applications
- **cell_values** - Cell data (JSONB for flexibility)

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=sunday
DB_PASSWORD=sunday123
DB_DATABASE=sunday_db

# Application
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

## Production Deployment

1. **Build production images:**
   ```bash
   docker-compose build
   ```

2. **Run in production mode:**
   ```bash
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop services:**
   ```bash
   docker-compose down
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

---

**Built with ❤️ for job seekers everywhere**
