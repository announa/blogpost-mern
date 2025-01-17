import { Model, MongooseError } from 'mongoose';
import { User } from '../models/user.model';
import { ObjectId } from 'bson';
import fs from 'fs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Request, Response } from 'express';
import { loginInputParser, registerInputParser } from '../helpers/parameterParser';
import bcrypt from 'bcrypt';
import { verify } from 'crypto';

type UnwrapModel<T> = T extends Model<infer U> ? U : never;
type IUser = UnwrapModel<typeof User> & { _id: ObjectId };

type GetUserIdInput = {
  email: string;
  password: string;
};

const getUserId = async ({ email, password }: GetUserIdInput) => {
  console.log('Retrieving user from DB');
  let user: IUser | null = null;
  const result = await User.find({ email: email });
  if (result.length === 0) {
    throw new MongooseError('Incorrect login data');
  } else if (result.length > 1) {
    throw new MongooseError('More than one user found for the provided login data');
  }
  user = result[0];
  console.log('Found user in DB');
  try {
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new MongooseError('Incorrect login data');
    }
    return user._id;
  } catch (error) {
    console.error(error);
    throw new MongooseError('Incorrect login data');
  }
};

const generateJwt = (userId: ObjectId) => {
  console.log('generating token');
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

const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

export const register = async (req: Request, res: Response) => {
  try {
    const signUpInformation = registerInputParser.parse(req.body);
    const hashedPassword = await hashPassword(signUpInformation.password);
    const newUser = await User.create({ ...signUpInformation, password: hashedPassword });
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
