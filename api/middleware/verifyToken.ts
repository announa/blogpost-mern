import { NextFunction, Request, Response } from 'express';
import { readFileSync } from 'fs';
import { JwtPayload, verify } from 'jsonwebtoken';

// export const verifyJwtPayload = (token: JwtPayload) => {
//   if(!token.iss === process.env.TOKEN_ISS || !token.aud === process.env.TOKEN_AUD){

//   }
// }

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('Verifying token');
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    console.error('Missing authorization header');
    res.status(401).send('Missing authorization header');
  }
  const token = (authHeader as string).split(' ')[1];
  if (!token) {
    console.error('Missing token in authentication header');
    res.status(401).send('Missing token in authentication header');
  }
  const tokenKey = readFileSync('../certs/jwtKey.pem.pub', 'utf-8');
  const verified = verify(token, tokenKey) as JwtPayload;
  next();
};
