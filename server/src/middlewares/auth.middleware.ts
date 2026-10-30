import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../helpers/jwt';
import { AppError } from '../helpers/AppError';
import type { AuthUser } from '../types/express';

const BEARER_PREFIX = 'Bearer ';

const extractToken = (req: Request): string | null => {
  const header = req.headers.authorization;

  if (typeof header !== 'string' || !header.startsWith(BEARER_PREFIX)) {
    return null;
  }

  const token = header.slice(BEARER_PREFIX.length).trim();
  return token.length > 0 ? token : null;
};

// Verifies the token and converts the JWT payload into an AuthUser, or null
const resolveAuthUser = (token: string): AuthUser | null => {
  try {
    const decoded = verifyToken(token);

    if (typeof decoded === 'string' || decoded === null) {
      return null;
    }

    const { userId, role } = decoded as Record<string, unknown>;

    if (typeof userId !== 'number') {
      return null;
    }

    return {
      userId,
      role: typeof role === 'string' ? role : 'user',
    };
  } catch {
    // jwt.verify throws on invalid/expired tokens - treat as unauthenticated
    return null;
  }
};

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const token = extractToken(req);

  if (!token) {
    return next(
      new AppError('Authentication required. Provide a Bearer token.', 401),
    );
  }

  const user = resolveAuthUser(token);

  if (!user) {
    return next(new AppError('Invalid or expired token.', 401));
  }

  req.user = user;
  return next();
};

export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const token = extractToken(req);

  if (token) {
    const user = resolveAuthUser(token);
    if (user) {
      req.user = user;
    }
    // Invalid tokens are ignored on public endpoints rather than rejected
  }

  return next();
};
