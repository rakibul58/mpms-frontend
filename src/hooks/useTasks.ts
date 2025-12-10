import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient, { handleApiError } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { buildQueryString } from "@/lib/utils";
import {
  ITask,
  ICreateTaskInput,
  IUpdateTaskInput,
  ITaskFilters,
  IKanbanTasks,
  IApiResponse,
  TaskStatus,
} from "@/types";

const cleanFilters = <T extends Record<string, any>>(
  filters: T
): Partial<T> => {
  return Object.entries(filters).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      acc[key] = value;
    }
    return acc;
  }, {} as any);
};

// Query keys
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: ITaskFilters) =>
    [...taskKeys.lists(), cleanFilters(filters)] as const,
  myTasks: (filters: ITaskFilters) =>
    [...taskKeys.all, "my-tasks", cleanFilters(filters)] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  byProject: (projectId: string) =>
    [...taskKeys.all, "project", projectId] as const,
  bySprint: (sprintId: string) =>
    [...taskKeys.all, "sprint", sprintId] as const,
  kanban: (projectId: string, sprintId?: string) =>
    [...taskKeys.all, "kanban", projectId, sprintId] as const,
};

// Get all tasks with filters
export const useTasks = (filters: Partial<ITaskFilters> = {}) => {
  const cleanedFilters = cleanFilters(filters);

  return useQuery({
    queryKey: taskKeys.list(cleanedFilters as ITaskFilters),
    queryFn: async () => {
      const queryString = buildQueryString(cleanedFilters);
      const { data } = await apiClient.get<IApiResponse<ITask[]>>(
        `${API_ENDPOINTS.TASKS}${queryString}`
      );
      return data;
    },
  });
};

// Get my tasks
export const useMyTasks = (filters: Partial<ITaskFilters> = {}) => {
  const cleanedFilters = cleanFilters(filters);

  return useQuery({
    queryKey: taskKeys.myTasks(cleanedFilters as ITaskFilters),
    queryFn: async () => {
      const queryString = buildQueryString(cleanedFilters);
      const { data } = await apiClient.get<IApiResponse<ITask[]>>(
        `${API_ENDPOINTS.MY_TASKS}${queryString}`
      );
      return data;
    },
  });
};

// Get task by ID
export const useTask = (id: string) => {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<IApiResponse<ITask>>(
        API_ENDPOINTS.TASK_BY_ID(id)
      );
      return data.data;
    },
    enabled: !!id,
  });
};

// Get tasks by project
export const useTasksByProject = (projectId: string) => {
  return useQuery({
    queryKey: taskKeys.byProject(projectId),
    queryFn: async () => {
      const { data } = await apiClient.get<IApiResponse<ITask[]>>(
        API_ENDPOINTS.TASKS_BY_PROJECT(projectId)
      );
      return data.data;
    },
    enabled: !!projectId,
  });
};

// Get tasks by sprint
export const useTasksBySprint = (sprintId: string) => {
  return useQuery({
    queryKey: taskKeys.bySprint(sprintId),
    queryFn: async () => {
      const { data } = await apiClient.get<IApiResponse<ITask[]>>(
        API_ENDPOINTS.TASKS_BY_SPRINT(sprintId)
      );
      return data.data;
    },
    enabled: !!sprintId,
  });
};

// Get kanban tasks
export const useKanbanTasks = (projectId: string, sprintId?: string) => {
  return useQuery({
    queryKey: taskKeys.kanban(projectId, sprintId),
    queryFn: async () => {
      const queryString = sprintId ? `?sprintId=${sprintId}` : "";
      const { data } = await apiClient.get<IApiResponse<IKanbanTasks>>(
        `${API_ENDPOINTS.KANBAN_TASKS(projectId)}${queryString}`
      );
      return data.data;
    },
    enabled: !!projectId,
  });
};

// Create task
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: ICreateTaskInput) => {
      const { data } = await apiClient.post<IApiResponse<ITask>>(
        API_ENDPOINTS.TASKS,
        taskData
      );
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      if (
        (data as ITask).project &&
        typeof (data as ITask).project === "object"
      ) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.byProject((data as ITask).project._id),
        });
      }
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Update task
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: taskData,
    }: {
      id: string;
      data: IUpdateTaskInput;
    }) => {
      const { data } = await apiClient.patch<IApiResponse<ITask>>(
        API_ENDPOINTS.TASK_BY_ID(id),
        taskData
      );
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.setQueryData(taskKeys.detail((data as ITask)._id), data);
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Update task status
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { data } = await apiClient.patch<IApiResponse<ITask>>(
        API_ENDPOINTS.TASK_STATUS(id),
        { status }
      );
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.setQueryData(taskKeys.detail((data as ITask)._id), data);
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Log time
export const useLogTime = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      hours,
      description,
    }: {
      id: string;
      hours: number;
      description?: string;
    }) => {
      const { data } = await apiClient.post<IApiResponse<ITask>>(
        API_ENDPOINTS.LOG_TIME(id),
        { hours, description }
      );
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail((data as ITask)._id),
      });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Bulk update tasks (for drag and drop)
export const useBulkUpdateTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      tasks: Array<{
        taskId: string;
        status?: TaskStatus;
        order?: number;
        sprintId?: string | null;
      }>
    ) => {
      const { data } = await apiClient.patch<IApiResponse<ITask[]>>(
        API_ENDPOINTS.BULK_UPDATE_TASKS,
        { tasks }
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Delete task
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(API_ENDPOINTS.TASK_BY_ID(id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Add subtask
export const useAddSubtask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      title,
    }: {
      taskId: string;
      title: string;
    }) => {
      const { data } = await apiClient.post<IApiResponse<ITask>>(
        API_ENDPOINTS.SUBTASKS(taskId),
        { title }
      );
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(taskKeys.detail((data as ITask)._id), data);
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Update subtask
export const useUpdateSubtask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      subtaskId,
      data: subtaskData,
    }: {
      taskId: string;
      subtaskId: string;
      data: { title?: string; isCompleted?: boolean };
    }) => {
      const { data } = await apiClient.patch<IApiResponse<ITask>>(
        API_ENDPOINTS.SUBTASK_BY_ID(taskId, subtaskId),
        subtaskData
      );
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(taskKeys.detail((data as ITask)._id), data);
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Delete subtask
export const useDeleteSubtask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      subtaskId,
    }: {
      taskId: string;
      subtaskId: string;
    }) => {
      const { data } = await apiClient.delete<IApiResponse<ITask>>(
        API_ENDPOINTS.SUBTASK_BY_ID(taskId, subtaskId)
      );
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(taskKeys.detail((data as ITask)._id), data);
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};
