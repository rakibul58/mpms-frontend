export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  MEMBER: "member",
} as const;

export const PROJECT_STATUS = {
  PLANNED: "planned",
  ACTIVE: "active",
  COMPLETED: "completed",
  ARCHIVED: "archived",
} as const;

export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  DONE: "done",
} as const;

export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export const SPRINT_STATUS = {
  PLANNED: "planned",
  ACTIVE: "active",
  COMPLETED: "completed",
} as const;

// Display labels
export const PROJECT_STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const SPRINT_STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  active: "Active",
  completed: "Completed",
};

export const USER_ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  member: "Member",
};

// Colors for status badges
export const PROJECT_STATUS_COLORS: Record<string, string> = {
  planned: "bg-slate-100 text-slate-700",
  active: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-700",
};

export const TASK_STATUS_COLORS: Record<string, string> = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  review: "bg-yellow-100 text-yellow-700",
  done: "bg-green-100 text-green-700",
};

export const TASK_PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export const SPRINT_STATUS_COLORS: Record<string, string> = {
  planned: "bg-slate-100 text-slate-700",
  active: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROJECTS: "/projects",
  PROJECT_DETAILS: (id: string) => `/projects/${id}`,
  MY_TASKS: "/my-tasks",
  TEAM: "/team",
  REPORTS: "/reports",
  SETTINGS: "/settings",
  PROFILE: "/profile",
} as const;

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh-token",
  ME: "/auth/me",

  // Users
  USERS: "/users",
  USER_PROFILE: "/users/profile",
  USER_BY_ID: (id: string) => `/users/${id}`,
  TEAM_MEMBERS: "/users/team-members",
  USER_STATS: "/users/stats",
  CHANGE_PASSWORD: "/users/change-password",

  // Projects
  PROJECTS: "/projects",
  MY_PROJECTS: "/projects/my-projects",
  PROJECT_BY_ID: (id: string) => `/projects/${id}`,
  PROJECT_STATS: (id: string) => `/projects/${id}/stats`,
  PROJECT_TEAM: (id: string) => `/projects/${id}/team-members`,

  // Sprints
  SPRINTS: "/sprints",
  SPRINTS_BY_PROJECT: (projectId: string) => `/sprints/project/${projectId}`,
  ALL_SPRINTS_BY_PROJECT: (projectId: string) =>
    `/sprints/project/${projectId}/all`,
  ACTIVE_SPRINT: (projectId: string) => `/sprints/project/${projectId}/active`,
  SPRINT_BY_ID: (id: string) => `/sprints/${id}`,
  SPRINT_STATS: (id: string) => `/sprints/${id}/stats`,
  REORDER_SPRINTS: (projectId: string) =>
    `/sprints/project/${projectId}/reorder`,

  // Tasks
  TASKS: "/tasks",
  MY_TASKS: "/tasks/my-tasks",
  TASK_BY_ID: (id: string) => `/tasks/${id}`,
  TASKS_BY_PROJECT: (projectId: string) => `/tasks/project/${projectId}`,
  KANBAN_TASKS: (projectId: string) => `/tasks/project/${projectId}/kanban`,
  TASKS_BY_SPRINT: (sprintId: string) => `/tasks/sprint/${sprintId}`,
  TASK_STATUS: (id: string) => `/tasks/${id}/status`,
  LOG_TIME: (id: string) => `/tasks/${id}/log-time`,
  BULK_UPDATE_TASKS: "/tasks/bulk-update",
  SUBTASKS: (taskId: string) => `/tasks/${taskId}/subtasks`,
  SUBTASK_BY_ID: (taskId: string, subtaskId: string) =>
    `/tasks/${taskId}/subtasks/${subtaskId}`,

  // Comments
  COMMENTS_BY_TASK: (taskId: string) => `/comments/task/${taskId}`,
  ALL_COMMENTS_BY_TASK: (taskId: string) => `/comments/task/${taskId}/all`,
  COMMENT_BY_ID: (id: string) => `/comments/${id}`,

  // Reports
  DASHBOARD_STATS: "/reports/dashboard",
  MY_REPORT: "/reports/my-report",
  PROJECT_REPORT: (projectId: string) => `/reports/project/${projectId}`,
  USER_REPORT: (userId: string) => `/reports/user/${userId}`,
  TIME_LOG_REPORT: "/reports/time-logs",
} as const;
