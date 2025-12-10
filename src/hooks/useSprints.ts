import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient, { handleApiError } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { buildQueryString } from '@/lib/utils';
import {
  ISprint,
  ISprintWithStats,
  ICreateSprintInput,
  IApiResponse,
  SprintStatus,
  IProject,
} from '@/types';

// Query keys
export const sprintKeys = {
  all: ['sprints'] as const,
  byProject: (projectId: string) => [...sprintKeys.all, 'project', projectId] as const,
  allByProject: (projectId: string) => [...sprintKeys.all, 'all', projectId] as const,
  active: (projectId: string) => [...sprintKeys.all, 'active', projectId] as const,
  details: () => [...sprintKeys.all, 'detail'] as const,
  detail: (id: string) => [...sprintKeys.details(), id] as const,
  stats: (id: string) => [...sprintKeys.all, 'stats', id] as const,
};

// Get sprints by project (paginated)
export const useSprintsByProject = (projectId: string, filters: { status?: SprintStatus; page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: sprintKeys.byProject(projectId),
    queryFn: async () => {
      const queryString = buildQueryString(filters);
      const { data } = await apiClient.get<IApiResponse<ISprint[]>>(
        `${API_ENDPOINTS.SPRINTS_BY_PROJECT(projectId)}${queryString}`
      );
      return data;
    },
    enabled: !!projectId,
  });
};

// Get all sprints by project (no pagination)
export const useAllSprintsByProject = (projectId: string) => {
  return useQuery({
    queryKey: sprintKeys.allByProject(projectId),
    queryFn: async () => {
      const { data } = await apiClient.get<IApiResponse<ISprint[]>>(
        API_ENDPOINTS.ALL_SPRINTS_BY_PROJECT(projectId)
      );
      return data.data;
    },
    enabled: !!projectId,
  });
};

// Get active sprint
export const useActiveSprint = (projectId: string) => {
  return useQuery({
    queryKey: sprintKeys.active(projectId),
    queryFn: async () => {
      const { data } = await apiClient.get<IApiResponse<ISprint | null>>(
        API_ENDPOINTS.ACTIVE_SPRINT(projectId)
      );
      return data.data;
    },
    enabled: !!projectId,
  });
};

// Get sprint by ID
export const useSprint = (id: string) => {
  return useQuery({
    queryKey: sprintKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<IApiResponse<ISprint>>(
        API_ENDPOINTS.SPRINT_BY_ID(id)
      );
      return data.data;
    },
    enabled: !!id,
  });
};

// Get sprint with stats
export const useSprintWithStats = (id: string) => {
  return useQuery({
    queryKey: sprintKeys.stats(id),
    queryFn: async () => {
      const { data } = await apiClient.get<IApiResponse<ISprintWithStats>>(
        API_ENDPOINTS.SPRINT_STATS(id)
      );
      return data.data;
    },
    enabled: !!id,
  });
};

// Create sprint
export const useCreateSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sprintData: ICreateSprintInput) => {
      const { data } = await apiClient.post<IApiResponse<ISprint>>(
        API_ENDPOINTS.SPRINTS,
        sprintData
      );
      return data.data;
    },
    onSuccess: (data) => {
      const projectId = typeof (data as ISprint).project === 'string' ? (data as ISprint).project : ((data as ISprint).project as IProject)._id;
      queryClient.invalidateQueries({ queryKey: sprintKeys.byProject(projectId as string) });
      queryClient.invalidateQueries({ queryKey: sprintKeys.allByProject(projectId as string) });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Update sprint
export const useUpdateSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: sprintData }: { id: string; data: Partial<ICreateSprintInput> }) => {
      const { data } = await apiClient.patch<IApiResponse<ISprint>>(
        API_ENDPOINTS.SPRINT_BY_ID(id),
        sprintData
      );
      return data.data;
    },
    onSuccess: (data) => {
      const projectId = typeof (data as ISprint).project === 'string' ? (data as ISprint).project : ((data as ISprint).project as IProject)._id;
      queryClient.invalidateQueries({ queryKey: sprintKeys.byProject(projectId as string) });
      queryClient.invalidateQueries({ queryKey: sprintKeys.allByProject(projectId as string) });
      queryClient.setQueryData(sprintKeys.detail((data as ISprint)._id), data);
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Delete sprint
export const useDeleteSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      await apiClient.delete(API_ENDPOINTS.SPRINT_BY_ID(id));
      return { id, projectId };
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: sprintKeys.byProject(projectId) });
      queryClient.invalidateQueries({ queryKey: sprintKeys.allByProject(projectId) });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Reorder sprints
export const useReorderSprints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, sprintOrders }: { 
      projectId: string; 
      sprintOrders: Array<{ sprintId: string; order: number }> 
    }) => {
      const { data } = await apiClient.patch<IApiResponse<ISprint[]>>(
        API_ENDPOINTS.REORDER_SPRINTS(projectId),
        { sprintOrders }
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: sprintKeys.byProject(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: sprintKeys.allByProject(variables.projectId) });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};
