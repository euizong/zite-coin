
import { Request, Response } from 'express';
import * as authService from '../service';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const token = await authService.login(email, password);
  if (!token) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token });
};
export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.query;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const token = await authService.login(String(email), String(password));
  if (!token) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token });
};