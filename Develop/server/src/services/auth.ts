import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_SECRET_KEY || '';
const expiration = '2h';

export const authMiddleware = ({ req }: { req: any }) => {
  let token = req.headers.authorization || '';

  if (token) {
    token = token.split(' ').pop()?.trim() || '';
  }

  if (!token) {
    return req;
  }

  try {
    const { data } = jwt.verify(token, secret, { maxAge: expiration }) as JwtPayload;
    req.user = data;
  } catch (error) {
    console.log('Invalid token');
  }

  return req;
};

export const authenticateToken = authMiddleware;

export const signToken = ({ username, email, _id }: { username: string, email: string, _id: string }) => {
  const payload = { username, email, _id };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};