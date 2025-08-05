import db from '../../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserDTO from '../../users/domain/user.dto';
import SessionDTO from '../domain/session.dto';
import { JWT_SECRET } from '../../../config';

// 로그인 시 액세스 토큰과 리프레시 토큰을 함께 발급
export const login = async (
  email: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string } | null> => {
  const user = await db('users').where({ email }).first();
  if (!user) return null;
  const match = await bcrypt.compare(password, user.password);
  if (!match) return null;

  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET as string,
    { expiresIn: '1d' }
  );

  // 리프레시 토큰 발급 (7일 만료)
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET as string,
    { expiresIn: '7d' }
  );


  // sessions 테이블에 리프레시 토큰 저장
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일 후
  await db<SessionDTO>('sessions').insert({
    user_id: user.id,
    token: refreshToken,
    expires_at: expiresAt,
    revoked: false
  });

  return { accessToken, refreshToken };
};
