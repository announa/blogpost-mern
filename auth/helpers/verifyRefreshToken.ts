import { NextFunction, Request, Response } from 'express';
import { readFileSync } from 'fs';
import { JwtPayload, verify } from 'jsonwebtoken';
import { CustomError, ICustomError } from '../class/CustomError';
import { getFile } from './getFile';

const verifyJwt = (token: string, publicKey: string) => {
  try {
    const verified = verify(token, publicKey) as JwtPayload;
    return verified;
  } catch (error) {
    console.error(error);
    throw new CustomError('Invalid token', 401);
  }
};

export const verifyRefreshToken = (token: string) => {
  console.log('Verifying token');
  const publicKey = getFile(process.env.PUBLIC_REFRESH_TOKEN_KEY as string) as string;
  if (!publicKey) {
    console.error('Public key not found');
    throw new CustomError('Internal server error', 500);
  } else {
    return verifyJwt(token, publicKey);
  }
};
