import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient, { handleApiError } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { buildQueryString } from "@/lib/utils";
import { IUser, IApiResponse, IPaginationParams, UserRole } from "@/types";

// Query keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (
    filters: IPaginationParams & { role?: UserRole; department?: string }
  ) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  teamMembers: () => [...userKeys.all, "team-members"] as const,
  stats: () => [...userKeys.all, "stats"] as const,
};

// Get all users
export const useUsers = (
  filters: Partial<IPaginationParams> & {
    role?: UserRole;
    department?: string;
    isActive?: string;
  } = {}
) => {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      const queryString = buildQueryString(filters);
      const { data } = await apiClient.get<IApiResponse<IUser[]>>(
        `${API_ENDPOINTS.USERS}${queryString}`
      );
      return data;
    },
  });
};

// Get user by ID
export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<IApiResponse<IUser>>(
        API_ENDPOINTS.USER_BY_ID(id)
      );
      return data.data;
    },
    enabled: !!id,
  });
};

// Get team members
export const useTeamMembers = () => {
  return useQuery({
    queryKey: userKeys.teamMembers(),
    queryFn: async () => {
      const { data } = await apiClient.get<IApiResponse<IUser[]>>(
        API_ENDPOINTS.TEAM_MEMBERS
      );
      return data.data;
    },
  });
};

// Get user stats
export const useUserStats = () => {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: async () => {
      const { data } = await apiClient.get<
        IApiResponse<{
          total: number;
          byRole: Record<string, number>;
          active: number;
          inactive: number;
        }>
      >(API_ENDPOINTS.USER_STATS);
      return data.data;
    },
  });
};

// Create user (admin)
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: {
      name: string;
      email: string;
      password: string;
      role?: UserRole;
      department?: string;
      skills?: string[];
    }) => {
      const { data } = await apiClient.post<IApiResponse<IUser>>(
        API_ENDPOINTS.USERS,
        userData
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: userData,
    }: {
      id: string;
      data: Partial<IUser>;
    }) => {
      const { data } = await apiClient.patch<IApiResponse<IUser>>(
        API_ENDPOINTS.USER_BY_ID(id),
        userData
      );
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.setQueryData(userKeys.detail((data as IUser)._id), data);
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Update user role
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      const { data } = await apiClient.patch<IApiResponse<IUser>>(
        `${API_ENDPOINTS.USER_BY_ID(id)}/role`,
        { role }
      );
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.setQueryData(userKeys.detail((data as IUser)._id), data);
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(API_ENDPOINTS.USER_BY_ID(id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Change password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (passwordData: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      const { data } = await apiClient.post<IApiResponse<void>>(
        API_ENDPOINTS.CHANGE_PASSWORD,
        passwordData
      );
      return data;
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};
