import { Router } from 'express';

import { CommentController } from '../controllers/comment.controller';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import {
  createCommentSchema,
  commentQuerySchema,
  commentPostParamsSchema,
  commentParamsSchema,
} from '../schemas/comment.schema';

const router = Router();
const commentController = new CommentController();

/**
 * @openapi
 * /posts/{postId}/comments:
 *   get:
 *     tags: [Comments]
 *     summary: List comments of a post (paginated)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated comment list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     comments:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Comment' }
 *                     pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       404:
 *         description: Post not found
 */
router.get(
  '/:postId/comments',
  optionalAuth,
  validate({ params: commentPostParamsSchema, query: commentQuerySchema }),
  commentController.listComments,
);

/**
 * @openapi
 * /posts/{postId}/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Add a comment to a post
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string, example: Great post! Thanks for sharing. }
 *     responses:
 *       201:
 *         description: Comment created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Comment' }
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Post not found
 */
router.post(
  '/:postId/comments',
  requireAuth,
  validate({ params: commentPostParamsSchema, body: createCommentSchema }),
  commentController.createComment,
);

/**
 * @openapi
 * /posts/{postId}/comments/{commentId}/like:
 *   post:
 *     tags: [Comments]
 *     summary: Like a comment (increments the counter)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Comment liked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     likes: { type: integer }
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Comment or post not found
 */
router.post(
  '/:postId/comments/:commentId/like',
  requireAuth,
  validate({ params: commentParamsSchema }),
  commentController.likeComment,
);

/**
 * @openapi
 * /posts/{postId}/comments/{commentId}:
 *   delete:
 *     tags: [Comments]
 *     summary: Delete a comment (owner or admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Comment deleted
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Not authorized to delete this comment
 *       404:
 *         description: Comment or post not found
 */
router.delete(
  '/:postId/comments/:commentId',
  requireAuth,
  validate({ params: commentParamsSchema }),
  commentController.deleteComment,
);

export default router;
