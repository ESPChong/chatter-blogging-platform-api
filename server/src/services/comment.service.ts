import prisma from '../config/prisma';
import { AppError } from '../helpers/AppError';
import { buildPaginationMeta } from '../helpers/pagination';
import type { AuthUser } from '../types/express';
import type { CreateCommentInput } from '../schemas/comment.schema';

const commentInclude = {
  user: {
    select: {
      id: true,
      username: true,
    },
  },
} as const;

// Throws 404 when the post does not exist
const assertPostExists = async (postId: number): Promise<void> => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    throw new AppError('Post not found.', 404);
  }
};

// Throws 404 when the comment does not exist or does not belong to the post
const findCommentInPost = async (postId: number, commentId: number) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, postId: true, userId: true },
  });

  if (!comment || comment.postId !== postId) {
    throw new AppError('Comment not found.', 404);
  }

  return comment;
};

export class CommentService {
  // GET /api/posts/:postId/comments?page=1&limit=10
  async listComments(postId: number, page: number, limit: number) {
    await assertPostExists(postId);

    const skip = (page - 1) * limit;
    const where = { postId };

    const [comments, total] = await prisma.$transaction([
      prisma.comment.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
        include: commentInclude,
      }),
      prisma.comment.count({ where }),
    ]);

    return {
      comments,
      pagination: buildPaginationMeta(page, limit, total),
    };
  }

  // POST /api/posts/:postId/comments
  async createComment(
    postId: number,
    userId: number,
    data: CreateCommentInput,
  ) {
    await assertPostExists(postId);

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        user: {
          connect: { id: userId },
        },
        post: {
          connect: { id: postId },
        },
      },
      include: commentInclude,
    });

    return comment;
  }

  // POST /api/posts/:postId/comments/:commentId/like
  async likeComment(postId: number, commentId: number) {
    await findCommentInPost(postId, commentId);

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        likes: {
          increment: 1,
        },
      },
      select: {
        id: true,
        likes: true,
      },
    });

    return comment;
  }

  // DELETE /api/posts/:postId/comments/:commentId (owner or admin only)
  async deleteComment(postId: number, commentId: number, user: AuthUser) {
    const comment = await findCommentInPost(postId, commentId);

    if (comment.userId !== user.userId && user.role !== 'admin') {
      throw new AppError('You are not authorized to delete this comment.', 403);
    }

    await prisma.comment.delete({ where: { id: commentId } });

    return { id: commentId };
  }
}
