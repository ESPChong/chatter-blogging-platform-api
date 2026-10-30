import type { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service';
import { commentQuerySchema } from '../schemas/comment.schema';
import type { CreateCommentInput } from '../schemas/comment.schema';

export class CommentController {
  constructor(private commentService: CommentService = new CommentService()) {}

  /**
   * GET /api/posts/:postId/comments?page=1&limit=10
   * List comments of a post (offset pagination)
   */
  listComments = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const postId = Number(req.params.postId);
      // Re-parse for fully typed values (already validated by middleware)
      const { page, limit } = commentQuerySchema.parse(req.query);
      const result = await this.commentService.listComments(
        postId,
        page,
        limit,
      );

      res.status(200).json({
        success: true,
        message: 'Comments retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/posts/:postId/comments
   * Add a comment to a post (authenticated)
   */
  createComment = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const postId = Number(req.params.postId);
      const userId = req.user?.userId as number;
      const data = req.body as CreateCommentInput;
      const comment = await this.commentService.createComment(
        postId,
        userId,
        data,
      );

      res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/posts/:postId/comments/:commentId/like
   * Increment the like counter of a comment (authenticated)
   */
  likeComment = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const postId = Number(req.params.postId);
      const commentId = Number(req.params.commentId);
      const comment = await this.commentService.likeComment(postId, commentId);

      res.status(200).json({
        success: true,
        message: 'Comment liked successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/posts/:postId/comments/:commentId
   * Delete a comment (owner or admin only)
   */
  deleteComment = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const postId = Number(req.params.postId);
      const commentId = Number(req.params.commentId);
      const user = req.user as { userId: number; role: string };
      const result = await this.commentService.deleteComment(
        postId,
        commentId,
        user,
      );

      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
