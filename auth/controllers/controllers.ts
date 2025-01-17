import { Model, MongooseError } from 'mongoose';
import { User } from '../models/user.model';
import { ObjectId } from 'bson';
import fs from 'fs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Request, Response } from 'express';
import { loginInputParser, registerInputParser } from '../helpers/parameterParser';

type UnwrapModel<T> = T extends Model<infer U> ? U : never;
type IUser = UnwrapModel<typeof User> & { _id: ObjectId };

type GetUserIdInput = {
  email?: string;
  userName?: string;
  password?: string;
};

const getUserId = async ({ email, userName, password }: GetUserIdInput) => {
  console.log('Retrieving user from DB')
  let user: IUser[] | null = null;
  user = await User.find({ email: email, password: password });
  if (user.length === 0) {
    throw new MongooseError('Incorrect login data');
  } else if (user.length > 1) {
    throw new MongooseError('More than one user found for the provided login data');
  } else {
    console.log('Found user in DB:')
    console.log(user)
    return user[0]._id;
  }
};

const generateJwt = (userId: ObjectId) => {
  console.log('generating token')
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
  console.log('logging user in');
  try {
    const loginInformation = loginInputParser.parse(req.body);
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

export const register = async (req: Request, res: Response) => {
  try {
    const signUpInformation = registerInputParser.parse(req.body);
    const newUser = await User.create(signUpInformation);
    if (!newUser) {
      res.status(500).json({ message: 'Could not create new user' });
    }
    res.status(200).json(newUser);
  } catch (error: unknown) {
    const mongooseError = error as MongooseError;
    console.error(mongooseError);
    res.status(500).json({ message: mongooseError.message });
  }
};
