import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthTokenPayload extends JwtPayload {
  userId: string;
  role: string;
}

/*
|--------------------------------------------------------------------------
| Create Token
|--------------------------------------------------------------------------
*/

export function signToken(payload: object, expiresIn: SignOptions['expiresIn'] = '7d') {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
  });
}

/*
|--------------------------------------------------------------------------
| Verify Token
|--------------------------------------------------------------------------
*/

export function verifyToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded === 'string') {
    throw new Error('Invalid token payload');
  }

  if (!decoded.userId || typeof decoded.userId !== 'string') {
    throw new Error('User ID missing from token');
  }

  if (!decoded.role || typeof decoded.role !== 'string') {
    throw new Error('User role missing from token');
  }

  return decoded as AuthTokenPayload;
}
