import { Model, MongooseError } from 'mongoose';
import { User } from '../models/user.model';
import { ObjectId } from 'bson';
import fs from 'fs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Request, Response } from 'express';
import { z } from 'zod';
import validator from 'validator';

type UnwrapModel<T> = T extends Model<infer U> ? U : never;
type IUser = UnwrapModel<typeof User> & { _id: ObjectId };

type GetUserIdInput = {
  email?: string;
  userName?: string;
};

const getUserId = async ({ email, userName }: GetUserIdInput) => {
  let user: IUser[] | null = null;
  if (email) {
    user = await User.find({ email: email });
  } else if (userName) {
    user = await User.find({ userName: userName });
  }
  if (!user) {
    throw new MongooseError('No user found for the provided login information');
  } else if (user.length > 1) {
    throw new MongooseError('More than one user found for the provided login information');
  } else {
    return user[0]._id;
  }
};

const generateJwt = (userId: ObjectId) => {
  const signOptions: SignOptions = {
    expiresIn: '30s',
    algorithm: 'RS256',
    subject: userId.toString(),
    issuer: process.env.TOKEN_ISS,
    audience: process.env.TOKEN_AUD,
  };
  const secret = fs.readFileSync('./certs/jwtKey.pem', 'utf8');
  const token = jwt.sign({}, secret, signOptions);
  return token;
};

export const login = async (req: Request, res: Response) => {
  const loginInformation = { email: req.body.email, userName: req.body.userName };
  if (!loginInformation.email && !loginInformation.userName) {
    console.error('Invalid request. Email or user name has to be provided');
    res.status(401).json({ message: 'Invalid request' });
  }
  try {
    const userId = await getUserId(loginInformation);
    const token = generateJwt(userId);
    if (!token) {
      res.status(500).json({ message: 'Login failed' });
    } else {
      res.status(200).json(token);
    }
  } catch (error: unknown) {
    const mongooseError = error as MongooseError;
    console.error(mongooseError);
    res.status(500).json({ message: mongooseError.message });
  }
};

export const inputParser = z.object({
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  userName: z.string().nonempty(),
  email: z.string().refine((value) => validator.isEmail(value)),
  password: z.string().nonempty(),
});

export const register = async (req: Request, res: Response) => {
  const signUpInformation = inputParser.parse(req.body);
  try {
    const newUser = await User.create(signUpInformation);
    if (!newUser) {
      res.status(500).json({ message: 'Could not create new user' });
    } else {
      res.status(200).json(newUser);
    }
  } catch (error: unknown) {
    const mongooseError = error as MongooseError;
    console.error(mongooseError);
    res.status(500).json({ message: mongooseError.message });
  }
};
