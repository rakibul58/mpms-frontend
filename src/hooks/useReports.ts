import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { buildQueryString } from '@/lib/utils';
import {
  IDashboardStats,
  IProjectReport,
  IUserReport,
  IApiResponse,
} from '@/types';

// Query keys
export const reportKeys = {
  all: ['reports'] as const,
  dashboard: () => [...reportKeys.all, 'dashboard'] as const,
  myReport: () => [...reportKeys.all, 'my-report'] as const,
  project: (projectId: string) => [...reportKeys.all, 'project', projectId] as const,
  user: (userId: string) => [...reportKeys.all, 'user', userId] as const,
  timeLogs: (filters: Record<string, string | undefined>) => [...reportKeys.all, 'time-logs', filters] as const,
};

// Get dashboard statistics
export const useDashboardStats = () => {
  return useQuery({
    queryKey: reportKeys.dashboard(),
    queryFn: async () => {
      const { data } = await apiClient.get<IApiResponse<IDashboardStats>>(
        API_ENDPOINTS.DASHBOARD_STATS
      );
      return data.data;
    },
  });
};

// Get my report
export const useMyReport = () => {
  return useQuery({
    queryKey: reportKeys.myReport(),
    queryFn: async () => {
      const { data } = await apiClient.get<IApiResponse<IUserReport>>(
        API_ENDPOINTS.MY_REPORT
      );
      return data.data;
    },
  });
};

// Get project report
export const useProjectReport = (projectId: string) => {
  return useQuery({
    queryKey: reportKeys.project(projectId),
    queryFn: async () => {
      const { data } = await apiClient.get<IApiResponse<IProjectReport>>(
        API_ENDPOINTS.PROJECT_REPORT(projectId)
      );
      return data.data;
    },
    enabled: !!projectId,
  });
};

// Get user report
export const useUserReport = (userId: string) => {
  return useQuery({
    queryKey: reportKeys.user(userId),
    queryFn: async () => {
      const { data } = await apiClient.get<IApiResponse<IUserReport>>(
        API_ENDPOINTS.USER_REPORT(userId)
      );
      return data.data;
    },
    enabled: !!userId,
  });
};

// Get time log report
export const useTimeLogReport = (filters: {
  projectId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
} = {}) => {
  return useQuery({
    queryKey: reportKeys.timeLogs(filters),
    queryFn: async () => {
      const queryString = buildQueryString(filters);
      const { data } = await apiClient.get<IApiResponse<{
        totalHours: number;
        byUser: Array<{ userId: string; userName: string; hours: number }>;
        byTask: Array<{ taskId: string; taskTitle: string; hours: number }>;
      }>>(`${API_ENDPOINTS.TIME_LOG_REPORT}${queryString}`);
      return data.data;
    },
  });
};
