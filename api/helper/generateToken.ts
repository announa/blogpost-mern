import { ObjectId } from 'bson';
import jwt, { SignOptions } from 'jsonwebtoken';
import { getFile } from './getFile';
import { HTTPError } from '../class/HTTPError';
import { add } from 'date-fns';

export const generateRefreshToken = (userId: ObjectId | string) => {
  console.log('generating refresh token');
  const signOptions: SignOptions = {
    expiresIn: '1week',
    algorithm: 'RS256',
    subject: userId.toString(),
  };
  const secret = getFile(process.env.PRIVATE_REFRESH_TOKEN_KEY as string);
  if (!secret) {
    console.error('Public key not found');
    throw new HTTPError('Internal server error', 500);
  }
  const token = jwt.sign({}, secret, signOptions);
  const expiration = add(new Date(), { weeks: 1 }).getTime();
  return { token: token, expiration: expiration };
};

export const generateAccessToken = (userId: ObjectId | string) => {
  console.log('generating access token');
  const signOptions: SignOptions = {
    expiresIn: '30s',
    algorithm: 'RS256',
    subject: userId.toString(),
    issuer: process.env.TOKEN_ISS,
    audience: process.env.TOKEN_AUD,
  };
  const secret = getFile(process.env.PRIVATE_ACCESS_TOKEN_KEY as string);
  if (!secret) {
    console.error('Could not find private key');
    throw new HTTPError('Internal server error', 500);
  }
  const token = jwt.sign({}, secret, signOptions);
  const expiration = add(new Date(), { seconds: 30 }).getTime();
  return { token: token, expiration: expiration };
};
