import { z } from 'zod';

const tagSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, 'Tags must be 2 - 30 characters long.')
  .max(30, 'Tags must be 2 - 30 characters long.')
  .regex(
    /^[a-z0-9-]+$/,
    'Tags can only contain lowercase letters, numbers and hyphens.',
  );

export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters long.')
    .max(150, 'Title cannot exceed 150 characters.'),
  content: z
    .string()
    .trim()
    .min(3, 'Content must be at least 3 characters long.')
    .max(20000, 'Content cannot exceed 20000 characters.'),
  tags: z
    .array(tagSchema)
    .max(8, 'A post can have at most 8 tags.')
    .default([]),
});

export const updatePostSchema = z
  .object({
    title: createPostSchema.shape.title.optional(),
    content: createPostSchema.shape.content.optional(),
    tags: z
      .array(tagSchema)
      .max(8, 'A post can have at most 8 tags.')
      .optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.content !== undefined ||
      data.tags !== undefined,
    { message: 'Provide at least one field to update (title, content, tags).' },
  );

export const postQuerySchema = z.object({
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
  tag: z.string().trim().toLowerCase().optional(),
});

export const postParamsSchema = z.object({
  id: z.coerce.number().int().positive('Invalid post id.'),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostQuery = z.infer<typeof postQuerySchema>;
