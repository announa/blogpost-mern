import { JwtPayload, verify } from 'jsonwebtoken';
import { HTTPError } from '../../class/HTTPError';
import { getFile } from '../getFile';
import bcrypt from 'bcrypt';

const verifyJwt = (token: string, publicKey: string) => {
  try {
    const verified = verify(token, publicKey) as JwtPayload;
    return verified;
  } catch (error) {
    throw new HTTPError('Invalid token', 401);
  }
};

export const verifyRefreshToken = (token: string) => {
  console.log('Verifying token');
  const publicKey = Buffer.from(process.env.REFRESH_TOKEN_PUBLIC_KEY as string, 'base64').toString('utf-8');
  if (!publicKey) {
    throw new HTTPError('Internal server error', 500);
  } else {
    return verifyJwt(token, publicKey);
  }
};

export const verifyResetPasswordToken = async (requestToken: string, tokenFromDB: string, tokenCreation: NativeDate) => {
  const TEN_MINUTES = 1000 * 60 * 10;

  const isTokenValid = await bcrypt.compare(requestToken, tokenFromDB);
  if (!isTokenValid) {
    throw new HTTPError('Invalid reset token', 400);
  }

  const isTokenExpired = new Date().getTime() - new Date(tokenCreation).getTime() > TEN_MINUTES;
  if (isTokenExpired) {
    throw new HTTPError('The reset password token has expired', 400);
  }
};
