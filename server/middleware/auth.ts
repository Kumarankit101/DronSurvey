import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// JWT Secret - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'drone-survey-secret-key';

// Interface for the payload stored in JWT
export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Middleware to verify JWT token
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  // Get token from cookies
  const token = req.cookies.token;

  if (!token) {
    // No token, user is not authenticated
    return next();
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    // Invalid token
    console.error('JWT verification failed:', error);
    // Clear the invalid token
    res.clearCookie('token');
    next();
  }
};

// Middleware to require authentication for protected routes
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Generate JWT token
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// Set JWT token in HTTP-only cookie
export const setTokenCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'strict'
  });
};

// Clear JWT token cookie
export const clearTokenCookie = (res: Response) => {
  res.clearCookie('token');
};