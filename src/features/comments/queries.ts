'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/store/query-keys';
import { createComment, moderateComment, deleteComment } from './actions';
import type { CreateCommentInput, ModerateCommentInput } from './types';

export function useArticleComments(articleId: string) {
  return useQuery({
    queryKey: queryKeys.comments.byArticle(articleId),
    queryFn: async () => {
      const res = await fetch(`/api/comments?articleId=${articleId}`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      const json = await res.json();
      return json.data;
    },
    enabled: !!articleId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCommentInput) => {
      const res = await createComment(data);
      if (!res.success) throw new Error('Failed to create comment');
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.articleId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.comments.byArticle(data.articleId) });
      }
    },
  });
}

export function useModerateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ModerateCommentInput) => {
      const res = await moderateComment(data);
      if (!res.success) throw new Error('Failed to moderate comment');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
      if (data?.articleId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.comments.byArticle(data.articleId) });
      }
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, articleId }: { id: string; articleId: string }) => {
      const res = await deleteComment(id);
      if (!res.success) throw new Error('Failed to delete comment');
      return res;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byArticle(variables.articleId) });
    },
  });
}
