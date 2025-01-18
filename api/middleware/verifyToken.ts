import { NextFunction, Request, Response } from 'express';
import { readFileSync } from 'fs';
import { JwtPayload, verify } from 'jsonwebtoken';
import { CustomError, ICustomError } from '../class/CustomError';

const verifyJwt = (token: string, publicKey: string) => {
  try {
    const verified = verify(token, publicKey) as JwtPayload;
    if (verified.iss !== process.env.TOKEN_ISS || verified.aud !== process.env.TOKEN_AUD) {
      throw new Error('Invalid token: iss or aud claim not matching');
    }
  } catch (error) {
    console.error(error);
    throw new CustomError('Invalid token', 401);
  }
};

const getPublicKey = () => {
  try {
    const publicKey = readFileSync('./certs/jwtKey.pem.pub', 'utf-8');
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
      throw new CustomError('Missing authorization header', 401);
    }
    const token = (authHeader as string).split(' ')[1];
    if (!token) {
      console.error('Missing token in authentication header');
      throw new CustomError('Missing token in authentication header', 401);
    }
    const publicKey = getPublicKey() as string;
    if (!publicKey) {
      console.error('Public key not found');
      throw new CustomError('Internal server error', 500);
    }
    verifyJwt(token, publicKey);
    next();
  } catch (error: unknown) {
    const customError = error as ICustomError;
    res.status(customError.statusCode ?? 500).send(customError.message ?? 'Internal server error');
  }
};
