import prisma from '../config/prisma';
import { AppError } from '../helpers/AppError';
import { buildPaginationMeta } from '../helpers/pagination';
import type { AuthUser } from '../types/express';
import type {
  CreatePostInput,
  PostQuery,
  UpdatePostInput,
} from '../schemas/post.schema';

// Shared relation includes for every post response
const postInclude = {
  user: {
    select: {
      id: true,
      username: true,
    },
  },
  tags: true,
  _count: {
    select: {
      comments: true,
    },
  },
} as const;

// Ownership check: the author or an admin may modify a post
const assertCanModifyPost = (ownerId: number, user: AuthUser): void => {
  if (ownerId !== user.userId && user.role !== 'admin') {
    throw new AppError('You are not authorized to modify this post.', 403);
  }
};

// Normalise and deduplicate tag names (schema also normalises them,
// but the service stays safe when called directly)
const dedupeTags = (tags: string[]): string[] => [
  ...new Set(tags.map((name) => name.toLowerCase())),
];

export class PostService {
  // POST /api/posts
  async createPost(userId: number, data: CreatePostInput) {
    const tags = dedupeTags(data.tags ?? []);

    const post = await prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        user: {
          connect: { id: userId },
        },
        // connectOrCreate reuses an existing tag (unique name) or creates it
        tags: {
          connectOrCreate: tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: postInclude,
    });

    return post;
  }

  // GET /api/posts?page=1&limit=10&tag=tech
  async listPosts(query: PostQuery) {
    const { page, limit, tag } = query;
    const skip = (page - 1) * limit;

    const where = tag ? { tags: { some: { name: tag } } } : {};

    const [posts, total] = await prisma.$transaction([
      prisma.post.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
        include: postInclude,
      }),
      prisma.post.count({ where }),
    ]);

    return {
      posts,
      pagination: buildPaginationMeta(page, limit, total),
    };
  }

  // GET /api/posts/:id
  async getPostById(id: number) {
    const post = await prisma.post.findUnique({
      where: { id },
      include: postInclude,
    });

    if (!post) {
      throw new AppError('Post not found.', 404);
    }

    return post;
  }

  // PUT /api/posts/:id (owner or admin only)
  async updatePost(id: number, user: AuthUser, data: UpdatePostInput) {
    const existing = await prisma.post.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      throw new AppError('Post not found.', 404);
    }

    assertCanModifyPost(existing.userId, user);

    const tags = data.tags !== undefined ? dedupeTags(data.tags) : undefined;

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
        // Replace the full tag set only when tags were provided
        ...(tags !== undefined && {
          tags: {
            set: [],
            connectOrCreate: tags.map((name) => ({
              where: { name },
              create: { name },
            })),
          },
        }),
      },
      include: postInclude,
    });

    return post;
  }

  // DELETE /api/posts/:id (owner or admin only, comments cascade)
  async deletePost(id: number, user: AuthUser) {
    const existing = await prisma.post.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      throw new AppError('Post not found.', 404);
    }

    assertCanModifyPost(existing.userId, user);

    await prisma.post.delete({ where: { id } });

    return { id };
  }
}
