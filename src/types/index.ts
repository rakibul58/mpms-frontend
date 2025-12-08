// User types
export type UserRole = "admin" | "manager" | "member";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  skills: string[];
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ILoginResponse {
  user: IUser;
  tokens: IAuthTokens;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IRegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department?: string;
}

// Project types
export type ProjectStatus = "planned" | "active" | "completed" | "archived";

export interface IProject {
  _id: string;
  title: string;
  slug: string;
  client: string;
  description?: string;
  startDate: string;
  endDate?: string;
  budget?: number;
  status: ProjectStatus;
  thumbnail?: string;
  createdBy: IUser;
  teamMembers: IUser[];
  managers: IUser[];
  createdAt: string;
  updatedAt: string;
}

export interface IProjectWithStats {
  project: IProject;
  stats: {
    totalTasks: number;
    completedTasks: number;
    progress: number;
    totalSprints: number;
    activeSprints: number;
  };
}

export interface ICreateProjectInput {
  title: string;
  client: string;
  description?: string;
  startDate: string;
  endDate?: string;
  budget?: number;
  status?: ProjectStatus;
  teamMembers?: string[];
  managers?: string[];
}

// Sprint types
export type SprintStatus = "planned" | "active" | "completed";

export interface ISprint {
  _id: string;
  title: string;
  sprintNumber: number;
  project: IProject | string;
  description?: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  goals?: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ISprintWithStats {
  sprint: ISprint;
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    progress: number;
  };
}

export interface ICreateSprintInput {
  title: string;
  projectId: string;
  description?: string;
  startDate: string;
  endDate: string;
  status?: SprintStatus;
  goals?: string[];
}

// Task types
export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface ISubtask {
  _id: string;
  title: string;
  isCompleted: boolean;
}

export interface IAttachment {
  _id: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadedBy: IUser;
  uploadedAt: string;
}

export interface IActivityLog {
  _id: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  performedBy: IUser;
  performedAt: string;
}

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  project: IProject | { _id: string; title: string; slug: string };
  sprint?: ISprint | { _id: string; title: string; sprintNumber: number };
  assignees: IUser[];
  createdBy: IUser;
  estimate?: number;
  timeLogged: number;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  completedAt?: string;
  subtasks: ISubtask[];
  attachments: IAttachment[];
  activityLog: IActivityLog[];
  order: number;
  requiresReview: boolean;
  reviewedBy?: IUser;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateTaskInput {
  title: string;
  description?: string;
  projectId: string;
  sprintId?: string;
  assignees?: string[];
  estimate?: number;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  subtasks?: { title: string; isCompleted?: boolean }[];
  requiresReview?: boolean;
}

export interface IUpdateTaskInput {
  title?: string;
  description?: string;
  sprintId?: string | null;
  assignees?: string[];
  estimate?: number | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string | null;
  subtasks?: { title: string; isCompleted?: boolean }[];
  requiresReview?: boolean;
  order?: number;
}

export interface IKanbanTasks {
  todo: ITask[];
  in_progress: ITask[];
  review: ITask[];
  done: ITask[];
}

// Comment types
export interface IComment {
  _id: string;
  content: string;
  task: string;
  author: IUser;
  parentComment?: string;
  isEdited: boolean;
  editedAt?: string;
  replies?: IComment[];
  createdAt: string;
  updatedAt: string;
}

// Report types
export interface IDashboardStats {
  overview: {
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    totalUsers: number;
    totalHoursLogged: number;
  };
  projectsByStatus: Record<string, number>;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  recentProjects: Array<{
    _id: string;
    title: string;
    status: string;
    progress: number;
  }>;
  upcomingDeadlines: Array<{
    _id: string;
    title: string;
    project: { title: string };
    dueDate: string;
    status: string;
  }>;
}

export interface IProjectReport {
  project: {
    _id: string;
    title: string;
    status: string;
    startDate: string;
    endDate?: string;
  };
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    reviewTasks: number;
    progress: number;
    totalSprints: number;
    completedSprints: number;
    estimatedHours: number;
    loggedHours: number;
    teamSize: number;
  };
  tasksByPriority: Record<string, number>;
  recentActivity: {
    tasksCompletedThisWeek: number;
    tasksCreatedThisWeek: number;
  };
}

export interface IUserReport {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  stats: {
    assignedTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    totalHoursLogged: number;
    completionRate: number;
  };
  tasksByProject: Array<{
    projectId: string;
    projectTitle: string;
    taskCount: number;
    completedCount: number;
  }>;
}

// API Response types
export interface IApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

export interface IPaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
}

// Filter types
export interface IProjectFilters extends IPaginationParams {
  status?: ProjectStatus;
  client?: string;
}

export interface ITaskFilters extends IPaginationParams {
  projectId?: string;
  sprintId?: string;
  assignee?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}
