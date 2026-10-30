import { Router } from 'express';

import { PostController } from '../controllers/post.controller';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import {
  createPostSchema,
  updatePostSchema,
  postQuerySchema,
  postParamsSchema,
} from '../schemas/post.schema';
import commentRoutes from './comment.routes';

const router = Router();
const postController = new PostController();

// Comment endpoints nested under /api/posts/:postId/...
router.use(commentRoutes);

/**
 * @openapi
 * /posts:
 *   get:
 *     tags: [Posts]
 *     summary: List posts (paginated, filterable by tag)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 10 }
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *         description: Return only posts tagged with this name
 *     responses:
 *       200:
 *         description: Paginated post feed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     posts:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Post' }
 *                     pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       400:
 *         description: Invalid query parameters
 */
router.get(
  '/',
  optionalAuth,
  validate({ query: postQuerySchema }),
  postController.listPosts,
);

/**
 * @openapi
 * /posts:
 *   post:
 *     tags: [Posts]
 *     summary: Create a post
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title: { type: string, example: My First Blog Post }
 *               content: { type: string, example: This is the content of my first blog post. }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *                 example: [technology, programming]
 *     responses:
 *       201:
 *         description: Post created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Post' }
 *       401:
 *         description: Missing or invalid token
 */
router.post(
  '/',
  requireAuth,
  validate({ body: createPostSchema }),
  postController.createPost,
);

/**
 * @openapi
 * /posts/{id}:
 *   get:
 *     tags: [Posts]
 *     summary: Get a single post by id
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Post details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Post' }
 *       404:
 *         description: Post not found
 */
router.get(
  '/:id',
  optionalAuth,
  validate({ params: postParamsSchema }),
  postController.getPostById,
);

/**
 * @openapi
 * /posts/{id}:
 *   put:
 *     tags: [Posts]
 *     summary: Update a post (owner or admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       200:
 *         description: Post updated
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Not authorized to modify this post
 *       404:
 *         description: Post not found
 */
router.put(
  '/:id',
  requireAuth,
  validate({ params: postParamsSchema, body: updatePostSchema }),
  postController.updatePost,
);

/**
 * @openapi
 * /posts/{id}:
 *   delete:
 *     tags: [Posts]
 *     summary: Delete a post (owner or admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Post deleted
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Not authorized to delete this post
 *       404:
 *         description: Post not found
 */
router.delete(
  '/:id',
  requireAuth,
  validate({ params: postParamsSchema }),
  postController.deletePost,
);

export default router;
