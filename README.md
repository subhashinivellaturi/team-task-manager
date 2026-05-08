# Team Task Manager

A full-stack web application for managing team projects and tasks with role-based permissions, built with Node.js, Express, PostgreSQL, Prisma, React, Vite, TailwindCSS, and deployed on Railway.

---

## 🚀 Live Demo

[Live URL coming soon]

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL, Prisma ORM
- **Auth:** JWT, bcrypt
- **Validation:** zod
- **Frontend:** React, Vite, TailwindCSS
- **HTTP Client:** Axios, React Query
- **Deployment:** Railway

---

## ⚡ Local Setup

1. **Clone the repo:**
   ```sh
   git clone <repo-url>
   cd ethera
   ```
2. **Backend setup:**
   ```sh
   cd backend
   cp .env.example .env
   npm install
   npx prisma migrate dev
   npm run dev
   ```
3. **Frontend setup:**
   ```sh
   cd ../frontend
   cp .env.example .env
   npm install
   npm run dev
   ```

---

## 📚 API Endpoints

| Method | Endpoint                        | Description                                  |
|--------|----------------------------------|----------------------------------------------|
| POST   | /api/auth/signup                | Register new user                            |
| POST   | /api/auth/login                 | Login user                                   |
| GET    | /api/projects                   | List all projects for user                   |
| POST   | /api/projects                   | Create new project                           |
| GET    | /api/projects/:id               | Get project detail                           |
| PUT    | /api/projects/:id               | Update project (admin only)                  |
| DELETE | /api/projects/:id               | Delete project (admin only)                  |
| POST   | /api/projects/:id/members       | Invite member (admin only)                   |
| DELETE | /api/projects/:id/members/:userId | Remove member (admin only)                 |
| GET    | /api/tasks?projectId=xxx        | List tasks for project                       |
| POST   | /api/tasks                      | Create task (admin only)                     |
| PUT    | /api/tasks/:id                  | Update task                                  |
| DELETE | /api/tasks/:id                  | Delete task (admin only)                     |
| GET    | /api/dashboard                  | Dashboard stats for user                     |

---

## ✨ Features

- User authentication (JWT)
- Project CRUD with member management
- Task CRUD with assignee, status, priority, due date
- Dashboard with stats, overdue/recent tasks
- Role-based permissions (admin/member)
- Responsive UI with TailwindCSS
- Toasts and loading spinners for UX

---

## 👥 Role Permissions

| Action                | Admin         | Member        |
|-----------------------|--------------|--------------|
| View projects/tasks   | ✅           | ✅           |
| Create project        | ✅           | ✅           |
| Edit project          | ✅           | ❌           |
| Delete project        | ✅           | ❌           |
| Invite/remove member  | ✅           | ❌           |
| Create task           | ✅           | ❌           |
| Edit task (all fields)| ✅           | ❌           |
| Update own task status| ✅           | ✅           |
| Delete task           | ✅           | ❌           |

---

## 🖼️ Screenshots

> _Add screenshots here after deployment_

---

## 📄 License

MIT
