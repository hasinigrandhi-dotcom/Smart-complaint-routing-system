import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { JWT_SECRET } from '../config';

export type UserRole = 'USER' | 'ADMIN';

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}) {
  /**
   * Create a new user and return a JWT token. Passwords are hashed using
   * `bcryptjs` to match the application's login flow.
   * This service performs basic validation (length, uniqueness) before
   * creating the user in Prisma.
   */
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password;

  if (!name || !email || !password) {
    throw Object.assign(new Error('Name, email and password are required'), { status: 400 });
  }

  if (password.length < 6) {
    throw Object.assign(new Error('Password must be at least 6 characters long'), { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw Object.assign(new Error('User with this email already exists'), { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: input.role === 'ADMIN' ? 'ADMIN' : 'USER'
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  const token = generateToken(user.id, user.email, user.role);

  return {
    user,
    token
  };
}

export async function loginUser(input: { email: string; password: string }) {
  /**
   * Authenticate a user by email and password. Returns a JWT token on success.
   */
  const email = input.email?.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    throw Object.assign(new Error('Email and password are required'), { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  }

  const token = generateToken(user.id, user.email, user.role);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
}

function generateToken(userId: string, email: string, role: string) {
  return jwt.sign({ sub: userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
}
