import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient, { handleApiError } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { IComment, IApiResponse } from "@/types";

// Query keys
export const commentKeys = {
  all: ["comments"] as const,
  byTask: (taskId: string) => [...commentKeys.all, "task", taskId] as const,
  detail: (id: string) => [...commentKeys.all, "detail", id] as const,
};

// Get comments by task
export const useCommentsByTask = (taskId: string) => {
  return useQuery({
    queryKey: commentKeys.byTask(taskId),
    queryFn: async () => {
      const { data } = await apiClient.get<IApiResponse<IComment[]>>(
        API_ENDPOINTS.ALL_COMMENTS_BY_TASK(taskId)
      );
      return data.data;
    },
    enabled: !!taskId,
  });
};

// Create comment
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      content,
      parentCommentId,
    }: {
      taskId: string;
      content: string;
      parentCommentId?: string;
    }) => {
      const { data } = await apiClient.post<IApiResponse<IComment>>(
        API_ENDPOINTS.COMMENTS_BY_TASK(taskId),
        { content, parentCommentId }
      );
      return { comment: data.data, taskId };
    },
    onSuccess: ({ taskId }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byTask(taskId) });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Update comment
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      content,
      taskId,
    }: {
      id: string;
      content: string;
      taskId: string;
    }) => {
      const { data } = await apiClient.patch<IApiResponse<IComment>>(
        API_ENDPOINTS.COMMENT_BY_ID(id),
        { content }
      );
      return { comment: data.data, taskId };
    },
    onSuccess: ({ taskId }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byTask(taskId) });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

// Delete comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, taskId }: { id: string; taskId: string }) => {
      await apiClient.delete(API_ENDPOINTS.COMMENT_BY_ID(id));
      return taskId;
    },
    onSuccess: (taskId) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byTask(taskId) });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};
