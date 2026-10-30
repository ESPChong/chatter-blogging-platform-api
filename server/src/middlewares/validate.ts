import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodType } from 'zod';

interface ValidationShape {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

export const validate = (shape: ValidationShape) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (shape.body) {
        req.body = shape.body.parse(req.body);
      }

      if (shape.params) {
        shape.params.parse(req.params);
      }

      if (shape.query) {
        shape.query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.issues,
        });
      }
      next(error);
    }
  };
};
