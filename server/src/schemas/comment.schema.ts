import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty.')
    .max(2000, 'Comment cannot exceed 2000 characters.'),
});

export const commentQuerySchema = z.object({
  page: z.coerce
    .number()
    .int('Page must be an integer.')
    .min(1, 'Page must be at least 1.')
    .default(1),
  limit: z.coerce
    .number()
    .int('Limit must be an integer.')
    .min(1, 'Limit must be at least 1.')
    .max(50, 'Limit cannot exceed 50.')
    .default(10),
});

export const commentPostParamsSchema = z.object({
  postId: z.coerce.number().int().positive('Invalid post id.'),
});

export const commentParamsSchema = z.object({
  postId: z.coerce.number().int().positive('Invalid post id.'),
  commentId: z.coerce.number().int().positive('Invalid comment id.'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CommentQuery = z.infer<typeof commentQuerySchema>;
