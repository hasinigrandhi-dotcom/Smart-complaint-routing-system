import { Request, Response } from 'express';
import { loginUser, registerUser } from '../services/authService';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body || {};

    const result = await registerUser({
      name,
      email,
      password,
      role: role === 'ADMIN' ? 'ADMIN' : 'USER'
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      token: result.token
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    const result = await loginUser({ email, password });

    return res.status(200).json({
      message: 'Login successful',
      user: result.user,
      token: result.token
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || 'Login failed' });
  }
};
