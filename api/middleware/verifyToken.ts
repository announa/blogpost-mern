import { NextFunction, Request, Response } from 'express';
import { readFileSync } from 'fs';
import { JwtPayload, verify } from 'jsonwebtoken';
import { HTTPError } from '../class/HTTPError';
import { handleError } from '../helper/errorHandling';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

const verifyJwt = (token: string, publicKey: string) => {
  try {
    const verified = verify(token, publicKey) as JwtPayload;
    if (verified.iss !== process.env.TOKEN_ISS || verified.aud !== process.env.TOKEN_AUD) {
      throw new Error('Invalid token: iss or aud claim not matching');
    }
    return verified;
  } catch (error) {
    console.error(error);
    throw new HTTPError('Invalid token', 401);
  }
};

const getPublicKey = () => {
  try {
    const publicKey = readFileSync(process.env.PUBLIC_ACCESS_TOKEN_KEY as string, 'utf-8');
    return publicKey;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('Verifying token');
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      console.error('Missing authorization header');
      throw new HTTPError('Missing authorization header', 401);
    }
    const token = (authHeader as string).split(' ')[1];
    if (!token) {
      console.error('Missing token in authentication header');
      throw new HTTPError('Missing token in authentication header', 401);
    }
    const publicKey = getPublicKey() as string;
    if (!publicKey) {
      console.error('Public key not found');
      throw new HTTPError('Internal server error', 500);
    }
    console.log(token);
    const verified = verifyJwt(token, publicKey);
    req.userId = verified.sub ?? '';
    next();
  } catch (error) {
    handleError(error, res);
  }
};
