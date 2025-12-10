import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient, { handleApiError } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { buildQueryString } from "@/lib/utils";
import {
  IProject,
  IProjectWithStats,
  ICreateProjectInput,
  IProjectFilters,
  IApiResponse,
} from "@/types";

// Query keys
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters: IProjectFilters) =>
    [...projectKeys.lists(), filters] as const,
  myProjects: (filters: IProjectFilters) =>
    [...projectKeys.all, "my-projects", filters] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  stats: (id: string) => [...projectKeys.all, "stats", id] as const,
};

// Get all projects
export const useProjects = (filters: Partial<IProjectFilters> = {}) => {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: async () => {
      const queryString = buildQueryString(filters);
      const { data } = await apiClient.get<IApiResponse<IProject[]>>(
        `${API_ENDPOINTS.PROJECTS}${queryString}`
      );
      return data;
    },
  });
};

// Get my projects
export const useMyProjects = (filters: Partial<IProjectFilters> = {}) => {
  return useQuery({
    queryKey: projectKeys.myProjects(filters),
    queryFn: async () => {
      const queryString = buildQueryString(filters);
      const { data } = await apiClient.get<IApiResponse<IProject[]>>(
        `${API_ENDPOINTS.MY_PROJECTS}${queryString}`
      );
      return data;
    },
  });
};

// Get project by ID
export const useProject = (id: string) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<IApiResponse<IProject>>(
        API_ENDPOINTS.PROJECT_BY_ID(id)
      );
      return data.data;
    },
    enabled: !!id,
  });
};

// Get project with stats
export const useProjectWithStats = (id: string) => {
  return useQuery({
    queryKey: projectKeys.stats(id),
    queryFn: async () => {
      const { data } = await apiClient.get<IApiResponse<IProjectWithStats>>(
        API_ENDPOINTS.PROJECT_STATS(id)
      );
      return data.data;
    },
    enabled: !!id,
  });
};

// Create project
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectData: ICreateProjectInput) => {
      const { data } = await apiClient.post<IApiResponse<IProject>>(
        API_ENDPOINTS.PROJECTS,
        projectData
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Update project
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: projectData,
    }: {
      id: string;
      data: Partial<ICreateProjectInput>;
    }) => {
      const { data } = await apiClient.patch<IApiResponse<IProject>>(
        API_ENDPOINTS.PROJECT_BY_ID(id),
        projectData
      );
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.setQueryData(
        projectKeys.detail((data as IProject)._id),
        data
      );
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Delete project
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(API_ENDPOINTS.PROJECT_BY_ID(id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Add team members
export const useAddTeamMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      userIds,
    }: {
      projectId: string;
      userIds: string[];
    }) => {
      const { data } = await apiClient.post<IApiResponse<IProject>>(
        API_ENDPOINTS.PROJECT_TEAM(projectId),
        { userIds }
      );
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail((data as IProject)._id),
      });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Remove team members
export const useRemoveTeamMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      userIds,
    }: {
      projectId: string;
      userIds: string[];
    }) => {
      const { data } = await apiClient.delete<IApiResponse<IProject>>(
        API_ENDPOINTS.PROJECT_TEAM(projectId),
        { data: { userIds } }
      );
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail((data as IProject)._id),
      });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};
