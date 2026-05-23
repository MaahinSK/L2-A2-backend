import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, env.jwtSecret) as TokenPayload;
  } catch (error) {
    return null;
  }
};