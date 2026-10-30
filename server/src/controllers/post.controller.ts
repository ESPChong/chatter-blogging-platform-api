import type { Request, Response, NextFunction } from 'express';
import { PostService } from '../services/post.service';
import { postQuerySchema } from '../schemas/post.schema';
import type { CreatePostInput, UpdatePostInput } from '../schemas/post.schema';

export class PostController {
  constructor(private postService: PostService = new PostService()) {}

  /**
   * GET /api/posts?page=1&limit=10&tag=tech
   * List posts (offset pagination + optional tag filter)
   */
  listPosts = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Re-parse for fully typed values (already validated by middleware)
      const query = postQuerySchema.parse(req.query);
      const result = await this.postService.listPosts(query);

      res.status(200).json({
        success: true,
        message: 'Posts retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/posts/:id
   * Retrieve a single post with its author and tags
   */
  getPostById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const post = await this.postService.getPostById(id);

      res.status(200).json({
        success: true,
        message: 'Post retrieved successfully',
        data: post,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/posts
   * Create a post (authenticated)
   */
  createPost = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId as number;
      const data = req.body as CreatePostInput;
      const post = await this.postService.createPost(userId, data);

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: post,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/posts/:id
   * Update a post (owner or admin only)
   */
  updatePost = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const user = req.user as { userId: number; role: string };
      const data = req.body as UpdatePostInput;
      const post = await this.postService.updatePost(id, user, data);

      res.status(200).json({
        success: true,
        message: 'Post updated successfully',
        data: post,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/posts/:id
   * Delete a post (owner or admin only)
   */
  deletePost = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const user = req.user as { userId: number; role: string };
      const result = await this.postService.deletePost(id, user);

      res.status(200).json({
        success: true,
        message: 'Post deleted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
