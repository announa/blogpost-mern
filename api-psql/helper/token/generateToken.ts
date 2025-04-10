import { ObjectId } from 'bson';
import { add } from 'date-fns';
import jwt, { SignOptions } from 'jsonwebtoken';
import { HTTPError } from '../../class/HTTPError';
import { getFile } from '../getFile';

export const generateRefreshToken = (userId: number | string) => {
  console.log('generating refresh token');
  const signOptions: SignOptions = {
    expiresIn: '1week',
    algorithm: 'RS256',
    subject: userId.toString(),
  };
  const secret = Buffer.from(process.env.REFRESH_TOKEN_PRIVATE_KEY as string, 'base64').toString('utf-8');
  if (!secret) {
    console.error('Public key not found');
    throw new HTTPError('Internal server error', 500);
  }
  const token = jwt.sign({}, secret, signOptions);
  const expiration = add(new Date(), { weeks: 1 }).getTime();
  return { token: token, expiration: expiration };
};

export const generateAccessToken = (userId: number | string) => {
  console.log('generating access token');
  const signOptions: SignOptions = {
    expiresIn: '15min',
    algorithm: 'RS256',
    subject: userId.toString(),
    issuer: process.env.TOKEN_ISS,
    audience: process.env.TOKEN_AUD,
  };
  const secret = Buffer.from(process.env.ACCESS_TOKEN_PRIVATE_KEY as string, 'base64').toString('utf-8');
  if (!secret) {
    console.error('Could not find private key');
    throw new HTTPError('Internal server error', 500);
  }
  const token = jwt.sign({}, secret, signOptions);
  const expiration = add(new Date(), { minutes: 15 }).getTime();
  return { token: token, expiration: expiration };
};
