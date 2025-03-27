import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken, setTokenCookie, clearTokenCookie, JwtPayload } from '../middleware/auth.ts';
import { storage } from '../storage.js';
import { insertUserSchema } from '../../shared/schema.ts';
import { z } from 'zod';

const router = Router();

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

// Login route
router.post('/login', async (req: Request, res: Response) => {
  console.log("login req", req.body)
  try {
    // Validate input
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.format() });
    }

    const { username, password } = result.data;

    // Find user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Create JWT payload
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      role: user.role || 'user'
    };

    // Generate token and set cookie
    const token = generateToken(payload);
    setTokenCookie(res, token);

    // Return user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Register route
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Validate input using the schema from shared/schema.ts
    console.log("req.body", req.body)
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.format() });
    }

    const userData = result.data;
    console.log("userData", userData)

    // Check if username already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create user with hashed password
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword,
      role: userData.role || 'user' // Default role
    });

    console.log("user created ", user)

    // Create JWT payload
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      role: user.role || 'user'
    };

    // Generate token and set cookie
    const token = generateToken(payload);
    setTokenCookie(res, token);

    // Return user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    return res.status(201).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'An error occurred during registration' });
  }
});

// Logout route
router.post('/logout', (req: Request, res: Response) => {
  clearTokenCookie(res);
  return res.status(200).json({ message: 'Logged out successfully' });
});

// Get current user info
router.get('/me', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await storage.getUser(req.user.userId);
    if (!user) {
      // User not found in database but has a valid token
      clearTokenCookie(res);
      return res.status(401).json({ error: 'User not found' });
    }

    // Return user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'An error occurred while retrieving user information' });
  }
});

export default router;