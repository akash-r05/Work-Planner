import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/index.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'workplanner_super_secure_jwt_secret_key_2026';
export const TOKEN_EXPIRY = '7d';

export interface AuthRequest extends Request {
  user?: IUser;
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function setTokenCookie(res: Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export function clearTokenCookie(res: Response) {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    if (!decoded || !decoded.userId) {
      res.status(401).json({ success: false, message: 'Invalid or expired session token' });
      return;
    }

    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ success: false, message: 'User account not found' });
      return;
    }

    // Strip passwordHash before attaching
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Session expired, please log in again' });
  }
}
