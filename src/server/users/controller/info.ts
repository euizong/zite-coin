import { Request, Response } from 'express';
import * as usersService from '../service';
import jwt from 'jsonwebtoken';

export const getMyInfo = async (req: Request, res: Response) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'No token' });
    const token = auth.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
    const user = await usersService.getUserById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
