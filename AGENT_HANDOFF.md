# 🤝 Agent Handoff Protocol

**Project:** Sunday (Monday.com Clone)
**Date:** November 25, 2025
**Status:** Active Development / Deployment Ready

---

## 1. 🗺️ Project Overview
**Sunday** is a full-stack work OS clone (similar to Monday.com) built for tracking tasks, job applications, and projects.
- **Core Features:** Boards, Groups, Items, Columns (Status, Text, etc.), Drag & Drop, Automations.
- **Current Focus:** Adding navigation (Sidebar) and expanding views (Agenda, Calendar).

## 2. 🏗️ Tech Stack
- **Frontend:** React (Vite), TypeScript, TanStack Query, @dnd-kit, Axios.
- **Backend:** NestJS, TypeORM, PostgreSQL.
- **Infrastructure:** Docker, Docker Compose.
- **Deployment:** Configured for Render.com (`render.yaml`).

## 3. ⚡ Current State & Recent Changes

### ✅ Recently Implemented (Last Session) 
1.  **Sidebar Navigation:**
    - Added `Sidebar.tsx` with links to Board, Agenda, Calendar.
    - Updated `App.tsx` to handle view switching.
2.  **Group Management:**
    - **Backend:** Added `create` and `remove` endpoints to `GroupsController` & `GroupsService`.
    - **Frontend:** Added "Add New Group" button and "Delete Group" (×) button in `BoardTable.tsx`.
3.  **Views:**
    - "Agenda" and "Calendar" views are currently **placeholders** in `App.tsx`.

### 🚧 Works in Progress
- **Electron App:** The user asked to export as an app. We created the guide but the `npm run electron:build` script failed because the setup wasn't fully completed.
- **Test Coverage:** 26/31 tests passing. `ItemsService` has some failing tests related to position updates.

## 4. 🔑 Key Files to Know

### Frontend (`client/src`)
- **`components/BoardTable.tsx`**: The heart of the app. Handles drag & drop for items AND groups. **Complex logic here.**
- **`components/Sidebar.tsx`**: New navigation component.
- **`App.tsx`**: Main layout and view state manager.
- **`api/boardsApi.ts`**: API client. Recently updated with group endpoints.

### Backend (`src`)
- **`groups/groups.service.ts`**: Handles group logic. Recently added `create` and `remove`.
- **`automations/automations.service.ts`**: Event-driven automation engine (e.g., "When Status changes to Done, move to Done group").
- **`cells/cells.service.ts`**: Handles cell value updates.

## 5. 🐛 Known Issues & Todo List

1.  **Electron Build Failed**: The user tried `npm run electron:build` and it failed. **Action:** Need to properly initialize Electron files (`main.js`, `preload.js`) and scripts if the user wants to proceed with the desktop app.
2.  **Agenda/Calendar Views**: Currently just text placeholders. **Action:** Implement actual calendar/agenda logic.
3.  **Mobile Responsiveness**: The new Sidebar is fixed width (240px). Might break on small screens.

## 6. 🚀 How to Run

### Development (Docker)
```bash
# Start everything (Backend + Frontend + DB)
docker-compose up -d --build

# Backend runs on localhost:3000
# Frontend runs on localhost:80
```

### Manual Run
```bash
# Backend
npm run start:dev

# Frontend
cd client
npm run dev
```

## 7. 📚 Documentation
- **`TECHNICAL_DEEP_DIVE.md`**: Detailed architectural explanation. **READ THIS FIRST.**
- **`DEPLOY_NOW.md`**: Checklist for Render deployment.
- **`EXPORT_AS_APP.md`**: Guide for Electron/Capacitor export.

---

**Message to Next Agent:**
The user is satisfied with the current progress but wants to move fast. The immediate context is that we just finished adding the **Sidebar** and **Group CRUD** operations. The system is running in Docker. If the user asks about the "App" export again, fix the Electron setup first. Otherwise, proceed with implementing the Agenda or Calendar views.
