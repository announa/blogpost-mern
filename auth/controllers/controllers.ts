import bcrypt from 'bcrypt';
import { ObjectId } from 'bson';
import { Request, Response } from 'express';
import { Model, MongooseError } from 'mongoose';
import { CustomError } from '../class/CustomError';
import { generateAccessToken, generateRefreshToken } from '../helpers/generateToken';
import { hashPassword } from '../helpers/hasPassword';
import { loginInputParser, registerInputParser } from '../helpers/parameterParser';
import { verifyRefreshToken } from '../helpers/verifyRefreshToken';
import { User } from '../models/user.model';

type UnwrapModel<T> = T extends Model<infer U> ? U : never;
type IUser = UnwrapModel<typeof User> & { _id: ObjectId };

type GetUserIdInput = {
  email: string;
  password: string;
};

const getUserFromDb = async ({ email, password }: GetUserIdInput) => {
  console.log('Retrieving user from DB');
  let user: IUser | null = null;
  const result = await User.find({ email: email }).lean();
  if (result.length === 0) {
    throw new MongooseError('Incorrect login data');
  } else if (result.length > 1) {
    throw new MongooseError('More than one user found for the provided login data');
  }
  user = result[0];
  console.log('Found user in DB');
  const { password: dbUserPassword, _id, ...userData } = user;
  try {
    const passwordMatches = await bcrypt.compare(password, dbUserPassword);
    if (!passwordMatches) {
      throw new MongooseError('Incorrect login data');
    }
    return { ...userData, id: _id };
  } catch (error) {
    console.error(error);
    throw new MongooseError('Incorrect login data');
  }
};

export const login = async (req: Request, res: Response) => {
  console.log('logging user in');
  try {
    const loginInformation = loginInputParser.parse(req.body);
    const user = await getUserFromDb(loginInformation);
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    if (!accessToken || !refreshToken) {
      res.status(500).json({ message: 'Login failed' });
    } else {
      res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken, data: user });
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

export const getAccessToken = (req: Request, res: Response) => {
  try {
    const refreshToken = req.body.token;
    if (!refreshToken) {
      console.error('Missing token in payload');
      res.status(404).send('Missing token in payload');
    }
    const tokenPayload = verifyRefreshToken(refreshToken);
    const userId = tokenPayload.sub;
    if (!userId) {
      console.error('Invalid refresh token');
      res.status(404).send('Invalid refresh token');
    } else {
      const accessToken = generateAccessToken(userId);
      res.status(200).json({ accessToken: accessToken });
    }
  } catch (error) {
    console.error(error);
    if (error instanceof CustomError) {
      res.status(error.statusCode ?? 500).send(error.message);
    } else {
      res.status(500).send('Internal server error');
    }
  }
};
