import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import { generateToken } from '../helpers/jwt';
import { AppError } from '../helpers/AppError';
import type { RegisterInput } from '../schemas/auth.schema';

const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

// Fields that are safe to return to the client (never the password hash)
const publicUserSelect = {
  id: true,
  email: true,
  username: true,
  role: true,
  createdAt: true,
} as const;

export class AuthService {
  // Register new user
  async registerUser(userData: RegisterInput) {
    // Check if user already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingEmail) {
      throw new AppError('User already registered', 409);
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(
      userData.password,
      BCRYPT_SALT_ROUNDS,
    );

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        username: userData.username,
      },
      select: publicUserSelect,
    });

    // Generate JWT Token (role embedded for authorization checks)
    const token = generateToken({ userId: user.id, role: user.role });

    return {
      user,
      token,
    };
  }

  async loginUser(email: string, password: string) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT Token (role embedded for authorization checks)
    const token = generateToken({ userId: user.id, role: user.role });

    // returns and object consisting of a user object and a token
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      token,
    };
  }

  // Fetch the authenticated user's profile (GET /api/auth/me)
  async getUserById(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}
