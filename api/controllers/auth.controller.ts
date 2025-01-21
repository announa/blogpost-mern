import bcrypt from 'bcrypt';
import { ObjectId } from 'bson';
import { Request, Response } from 'express';
import { Model, MongooseError } from 'mongoose';
import { HTTPError } from '../class/HTTPError';
import { handleError } from '../helper/errorHandling';
import { generateAccessToken, generateRefreshToken } from '../helper/generateToken';
import { hashPassword } from '../helper/hasPassword';
import { loginInputParser, registerInputParser } from '../helper/parameterParser';
import { verifyRefreshToken } from '../helper/verifyRefreshToken';
import { RefreshToken } from '../models/refreshToken.model';
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

const storeRefreshToken = async (refreshToken: string, userId: ObjectId) => {
  console.log('storing refresh token: ', refreshToken);
  console.log('user: ', userId);
  const existingToken = await RefreshToken.findOne({ user: userId });
  console.log('existingToken: ', existingToken);
  if (existingToken) {
    const updatedToken = await RefreshToken.findByIdAndUpdate(
      existingToken._id,
      { $push: { token: refreshToken } },
      { new: true }
    );
    console.log(updatedToken);
  } else {
    const newToken = await RefreshToken.create({ user: userId, token: [refreshToken] });
  }
};

export const login = async (req: Request, res: Response) => {
  console.log('logging user in');
  try {
    const loginInformation = loginInputParser.parse(req.body);
    const user = await getUserFromDb(loginInformation);
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const refreshTokenDbEntry = await storeRefreshToken(refreshToken.token, user.id);
    console.log(refreshTokenDbEntry);
    if (!accessToken || !refreshToken) {
      throw new HTTPError('Internal server error', 500);
    } else {
      res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken, data: user });
    }
  } catch (error) {
    handleError(error, res);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const response = await RefreshToken.findOneAndDelete({ user: userId }).lean();
    console.log(response);
    res.status(200).send('Successfully logged out');
  } catch (error) {
    handleError(error, res);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const signUpInformation = registerInputParser.parse(req.body);
    const hashedPassword = await hashPassword(signUpInformation.password);
    const newUser = await User.create({ ...signUpInformation, password: hashedPassword });
    if (!newUser) {
      throw new HTTPError('Could not create new user', 500);
    }
    res.status(200).json(newUser);
  } catch (error) {
    handleError(error, res);
  }
};

export const token = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body.token;
    console.log('refreshToken: ', refreshToken);
    if (!refreshToken) {
      throw new HTTPError('Invalid request: token missing', 404);
    }
    const tokenPayload = verifyRefreshToken(refreshToken);
    const userId = tokenPayload.sub;
    if (!userId) {
      throw new HTTPError('Invalid refresh token', 404);
    } else {
      const response = await RefreshToken.findOne(
        { user: userId, token: refreshToken },
        {
          'token.$': 1,
        }
      ).lean();
      const dbRefreshToken = response?.token[0];
      console.log('DB REFRESH TOKEN', dbRefreshToken);
      if (!dbRefreshToken || dbRefreshToken !== refreshToken) {
        throw new HTTPError('Unauthorized', 401);
      }
      const accessToken = generateAccessToken(userId);
      res.status(200).json({ accessToken: accessToken });
    }
  } catch (error) {
    handleError(error, res);
  }
};
