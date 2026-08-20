// import jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET!;

// export function signToken(payload: object) {
//   return jwt.sign(payload, JWT_SECRET, {
//     expiresIn: '7d',
//   });
// }

// export function verifyToken(token: string) {
//   return jwt.verify(token, JWT_SECRET);
// }

import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthTokenPayload extends JwtPayload {
  userId: string;
  role: string;
}

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded === 'string') {
    throw new Error('Invalid token payload');
  }

  if (!decoded.userId || typeof decoded.userId !== 'string') {
    throw new Error('User ID missing from token');
  }

  return decoded as AuthTokenPayload;
}