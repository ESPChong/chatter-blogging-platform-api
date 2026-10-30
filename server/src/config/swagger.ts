import path from 'node:path';
import swaggerJsdoc from 'swagger-jsdoc';

const isProduction = process.env.NODE_ENV === 'production';

// Source route files: TypeScript in development, compiled JS in production
const apis = isProduction
  ? [path.join(__dirname, '..', 'routes', '*.js')]
  : ['src/routes/*.ts'];

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Chatter - Blogging Platform API',
      version: '1.0.0',
      description:
        'A production-ready blogging platform API with JWT authentication. ' +
        'Authenticate with any token-returning endpoint and click "Authorize" ' +
        'to explore the protected endpoints.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'johndoe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Tag: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'technology' },
          },
        },
        Post: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'My First Blog Post' },
            content: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            userId: { type: 'integer' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                username: { type: 'string' },
              },
            },
            tags: {
              type: 'array',
              items: { $ref: '#/components/schemas/Tag' },
            },
            _count: {
              type: 'object',
              properties: {
                comments: { type: 'integer' },
              },
            },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            content: { type: 'string', example: 'Great post!' },
            likes: { type: 'integer', example: 3 },
            createdAt: { type: 'string', format: 'date-time' },
            postId: { type: 'integer' },
            userId: { type: 'integer' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                username: { type: 'string' },
              },
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 42 },
            totalPages: { type: 'integer', example: 5 },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis,
});

export default swaggerSpec;
