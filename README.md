# MPMS Frontend - Minimal Project Management System

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React Query](https://img.shields.io/badge/TanStack_Query-5.0-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)

A modern, responsive project management dashboard built with Next.js 14, TypeScript, and Tailwind CSS.

[Features](#-features) •
[Tech Stack](#-tech-stack) •
[Getting Started](#-getting-started) •
[Project Structure](#-project-structure) •
[Deployment](#-deployment)

</div>

---

## 🚀 Features

### User Interface
- 🎨 Modern, clean design with shadcn/ui components
- 🌓 Dark/Light theme support
- 📱 Fully responsive design
- ⚡ Fast page loads with Next.js App Router
- 🎯 Collapsible sidebar navigation

### Authentication
- 🔐 JWT-based authentication
- 🔄 Automatic token refresh
- 👤 Role-based access control (Admin, Manager, Member)
- 🛡️ Protected routes

### Dashboard
- 📊 Real-time statistics and metrics
- 📈 Project progress tracking
- ⏰ Upcoming deadlines view
- 📋 Task distribution charts

### Project Management
- 📁 Create, edit, delete projects
- 👥 Team member management
- 📅 Date and status tracking
- 🔍 Search and filter capabilities

### Task Management
- ✅ Create and manage tasks
- 🏷️ Priority levels (Low, Medium, High, Urgent)
- 📋 Status workflow (To Do → In Progress → Review → Done)
- ⏱️ Time logging
- 📝 Subtasks support

### Team Management
- 👥 View all team members
- 🔍 Filter by role and search
- 📧 Contact information display

### Reports
- 📊 Dashboard analytics
- 📈 Task and project statistics
- ⏰ Time tracking reports

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.x |
| **Styling** | Tailwind CSS 3.4 |
| **Components** | shadcn/ui + Radix UI |
| **State Management** | Redux Toolkit + Redux Persist |
| **Server State** | TanStack Query (React Query) v5 |
| **Forms** | React Hook Form + Zod |
| **HTTP Client** | Axios |
| **Icons** | Lucide React |
| **Date Handling** | date-fns |
| **Theme** | next-themes |

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── dashboard/           # Main dashboard
│   │   ├── projects/            # Projects list & details
│   │   ├── my-tasks/            # User's tasks
│   │   ├── team/                # Team management
│   │   ├── reports/             # Analytics & reports
│   │   ├── settings/            # User settings
│   │   └── layout.tsx           # Dashboard layout wrapper
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home (redirects to login)
│
├── components/
│   ├── layout/                  # Layout components
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── Header.tsx          # Top header bar
│   │   └── DashboardLayout.tsx # Main layout wrapper
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ...
│
├── hooks/                       # Custom hooks (TanStack Query)
│   ├── useProjects.ts          # Project queries & mutations
│   ├── useTasks.ts             # Task queries & mutations
│   ├── useSprints.ts           # Sprint queries & mutations
│   ├── useUsers.ts             # User queries & mutations
│   ├── useReports.ts           # Report queries
│   └── useComments.ts          # Comment queries & mutations
│
├── lib/                         # Utilities & configuration
│   ├── api-client.ts           # Axios instance & interceptors
│   ├── constants.ts            # App constants & API endpoints
│   └── utils.ts                # Helper functions
│
├── providers/                   # React context providers
│   ├── ReduxProvider.tsx       # Redux store provider
│   ├── QueryProvider.tsx       # TanStack Query provider
│   ├── ThemeProvider.tsx       # Theme provider
│   └── index.tsx               # Combined providers
│
├── store/                       # Redux store
│   ├── slices/
│   │   ├── authSlice.ts        # Authentication state
│   │   └── uiSlice.ts          # UI state (sidebar, theme)
│   ├── hooks.ts                # Typed Redux hooks
│   └── index.ts                # Store configuration
│
└── types/                       # TypeScript definitions
    └── index.ts                # All type definitions
```

---

## 🏁 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend API running (see [mpms-backend](../mpms-backend))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mpms-frontend.git
   cd mpms-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your `.env.local` file**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |

---

## 🔑 Test Credentials

After seeding the backend, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mpms.com | Password123 |
| Manager | manager@mpms.com | Password123 |
| Member | john@mpms.com | Password123 |

---

## 🎨 Key Features Explained

### State Management Strategy

This project uses a **hybrid approach** to state management:

1. **Redux Toolkit** for:
   - Authentication state (user, tokens)
   - UI state (sidebar, theme preferences)
   - Persisted state across sessions

2. **TanStack Query** for:
   - Server data fetching
   - Caching and invalidation
   - Optimistic updates
   - Background refetching

This separation provides the best of both worlds - Redux for client-side state that needs to persist, and React Query for server state that needs to stay synchronized.

### Authentication Flow

```
1. User logs in → Tokens stored in localStorage
2. API client attaches token to requests
3. If 401 error → Attempt token refresh
4. If refresh fails → Redirect to login
```

### Role-Based Access

| Feature | Admin | Manager | Member |
|---------|-------|---------|--------|
| Dashboard Stats | ✅ | ✅ | Limited |
| Create Projects | ✅ | ✅ | ❌ |
| Manage Team | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | Own only |
| Manage Tasks | ✅ | ✅ | Assigned |

---

## 🚀 Deployment

### Deploy to Vercel

1. **Push code to GitHub**

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Framework Preset: Next.js (auto-detected)

3. **Add Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1
   ```

4. **Deploy**

### Build for Production

```bash
npm run build
npm run start
```

---

## 🔧 Configuration

### Tailwind CSS

The project uses a custom Tailwind configuration with:
- CSS variables for theming
- Custom color palette
- Animation utilities

### shadcn/ui Components

Components are located in `src/components/ui/` and include:
- Button, Input, Label
- Card, Badge, Avatar
- Dialog, Select, Dropdown Menu
- Toast notifications
- Progress, Skeleton loaders
- And more...

---

## 📱 Responsive Design

The app is fully responsive with breakpoints:
- **Mobile**: < 768px (collapsible sidebar)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

Your Name - [GitHub](https://github.com/yourusername)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

</div>
