# Work Planner
**Premium Spatial Productivity & Task Management Platform**

Work Planner is a modern, production-quality project and work management platform engineered with the MERN stack (Express.js, Node.js, React.js with Vite, and persistent document storage). It features a distinctive **Spatial Productivity** design system with hardware-accelerated 3D card elevation, interactive perspective transforms, ambient illumination, and fluid Kanban workflows.

---

## 🚀 Key Features

### 1. Spatial 3D Workspace Design System
- **Interactive 3D Project Cards**: Smooth pointer-reactive tilt and ambient glare using CSS `perspective(1000px)`, `transform-style: preserve-3d`, and depth offsets.
- **Glassmorphism Panels**: Restrained translucent surfaces with subtle borders and depth.
- **3D Progress Rings**: Circular SVG indicators with gradient strokes and animated stroke offsets.
- **Dark Midnight & Light Themes**: Dark theme (`#0B1020` canvas, `#141B2D` surfaces, `#8B5CF6` electric violet, `#22D3EE` cyan) and daylight mode with persistent preference.
- **Zero-Pill Discipline**: Metadata cleanly formatted with subtle unboxed typographic separators (`·`) and tabular figures (`tabular-nums`).

### 2. Full Task Management & CRUD
- Create, view, edit, and delete tasks with instant status updates.
- Assign priorities: `Low`, `Medium`, `High`, and `Urgent`.
- Manage 4-stage workflows: `To Do`, `In Progress`, `In Review`, and `Completed`.
- Subtask checklists with live checkbox toggles and completion counters.
- Tags, project associations, start dates, and target deadlines with overdue tracking.

### 3. Interactive Kanban Board
- 4-column drag-and-drop workflow (`To Do`, `In Progress`, `In Review`, `Completed`).
- Instant optimistic UI status updates synchronized directly to the database.
- Accessible alternative move buttons for keyboard and quick interactions.
- Column-specific quick task creation.

### 4. Project Initiatives & Calculated Progress
- Project creation with customizable color palettes, descriptions, and timelines.
- Project completion percentage dynamically computed from real associated tasks (not hardcoded).
- Project scoping and direct task filtering.

### 5. Timeline & Calendar Scheduling
- Monthly calendar grid with day, week, and month view awareness.
- Task deadlines positioned accurately on calendar dates.
- Click any calendar date to immediately schedule a task for that day.
- Visual distinction of overdue (rose/amber) vs upcoming vs completed items.

### 6. True Database Analytics & Reports
- 7-day velocity chart showing daily created vs completed deliverables using Recharts.
- Priority triage allocation breakdown.
- Initiative completion matrix table.

### 7. Authentication & Security
- Secure registration and login with password hashing via `bcryptjs`.
- JWT session tokens issued with HTTP-only cookies and Bearer token fallback.
- Resource ownership validation enforced on every private REST endpoint.
- One-click instant demo workspace for rapid exploration (`demo@workplanner.io` / `password123`).

---

## 🛠️ REST API Specification (`/api/v1`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new user account |
| `POST` | `/api/v1/auth/login` | Sign in with email & password |
| `POST` | `/api/v1/auth/logout` | Clear session cookie |
| `GET` | `/api/v1/auth/me` | Get authenticated user profile |
| `PATCH`| `/api/v1/auth/profile` | Update profile name, theme, preferences, password |
| `DELETE`| `/api/v1/auth/account` | Permanently delete account and all records |
| `GET` | `/api/v1/tasks` | Get tasks with search, filters, sorting, pagination |
| `POST` | `/api/v1/tasks` | Create new task |
| `GET` | `/api/v1/tasks/:id` | Get single task details |
| `PATCH`| `/api/v1/tasks/:id` | Update task details |
| `PATCH`| `/api/v1/tasks/:id/status` | Update task status (Kanban move) |
| `DELETE`| `/api/v1/tasks/:id` | Delete task |
| `GET` | `/api/v1/projects` | Get all projects with computed task stats |
| `POST` | `/api/v1/projects` | Create project |
| `GET` | `/api/v1/projects/:id` | Get project details and tasks |
| `PATCH`| `/api/v1/projects/:id` | Update project |
| `DELETE`| `/api/v1/projects/:id` | Delete project |
| `GET` | `/api/v1/dashboard/summary` | Get aggregated dashboard metrics |
| `GET` | `/api/v1/analytics/productivity` | Get 7-day productivity velocity data |
| `GET` | `/api/v1/analytics/tasks` | Get priority & status analytics |
| `GET` | `/api/v1/notifications` | Get in-app notifications |
| `PATCH`| `/api/v1/notifications/:id/read`| Mark single notification as read |
| `PATCH`| `/api/v1/notifications/read-all` | Mark all notifications as read |
| `POST` | `/api/v1/seed?force=true` | Seed or reset demo workspace |

---

## 📦 Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run tests:
   ```bash
   npm test
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   Access application at `http://localhost:3000`.
