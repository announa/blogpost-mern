import bcrypt from 'bcrypt';
import { ObjectId } from 'bson';
import { Request, Response } from 'express';
import mongoose, { Model, MongooseError } from 'mongoose';
import { HTTPError } from '../class/HTTPError';
import { handleError } from '../helper/errorHandling';
import { loginInputParser, passwordParser, registerInputParser } from '../helper/parameterParser';
import { generateAccessToken, generateRefreshToken } from '../helper/token/generateToken';
import { verifyRefreshToken, verifyResetPasswordToken } from '../helper/token/verifyToken';
import { RefreshToken as Token } from '../models/refreshToken.model';
import { User } from '../models/user.model';
import { getUserFromDb } from '../helper/dbRequests/getFromDb';
import crypto from 'crypto';
import { storeRefreshToken, storeResetToken } from '../helper/token/storeToken';
import { sendEmail } from '../helper/email/sendEmail';
import { generateResetEmailContent } from '../helper/email/generateResetEmailContent';
import { ResetToken } from '../models/resetToken.model';
import { verifyFields } from '../helper/dbRequests/verifyFields';

export type UnwrapModel<T> = T extends Model<infer U> ? U : never;
export type IUser = UnwrapModel<typeof User> & { _id: ObjectId };

export type GetUserIdInput = {
  email: string;
  password: string;
};

export const login = async (req: Request, res: Response) => {
  console.log('---------------- Login -----------------');
  try {
    const loginInformation = loginInputParser.parse(req.body);
    const user = await getUserFromDb(loginInformation);
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    if (!accessToken || !refreshToken) {
      throw new HTTPError('Internal server error', 500);
    }
    await storeRefreshToken(refreshToken.token, user.id);
    res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken, data: user });
  } catch (error) {
    handleError(error, res);
  }
};

export const logout = async (req: Request, res: Response) => {
  console.log('---------------- Logout -----------------');
  try {
    const userId = req.userId;
    const response = await Token.findOneAndDelete({ user: userId }).lean();
    console.log(response);
    res.status(200).send('Successfully logged out');
  } catch (error) {
    handleError(error, res);
  }
};

export const register = async (req: Request, res: Response) => {
  console.log('---------------- Registration -----------------');
  try {
    const signUpInformation = registerInputParser.parse(req.body);
    const hashedPassword = await bcrypt.hash(signUpInformation.password, 10);
    await verifyFields({ userName: signUpInformation.userName, email: signUpInformation.email });
    const newUser = await User.create({ ...signUpInformation, password: hashedPassword });
    if (!newUser) {
      throw new HTTPError('Could not create new user', 500);
    }
    console.log('Successfully created new user')
    res.status(200).json(newUser);
  } catch (error) {
    handleError(error, res);
  }
};

export const requestResetPassword = async (req: Request, res: Response) => {
  console.log('----------------- Sending reset password email ----------------');
  try {
    const email = req.body.email;
    if (!email) {
      throw new HTTPError('No email provided', 400);
    }
    const user = await User.findOne({ email: email }, '_id, email');
    if (!user) {
      console.error(`No user found for the email ${email}`);
      res.status(200).send('A password reset link has been sent to the provided email if this email exists');
      return;
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    await storeResetToken(resetToken, user._id);
    const content = generateResetEmailContent(resetToken, user.id);
    sendEmail({
      to: email,
      subject: 'Reset password for Postblog @annaludewig.net',
      html: content,
    });
    console.log('Reset password email successfully sent.');
    res.status(200).send('Reset password email successfully sent.');
  } catch (error) {
    handleError(error, res);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  console.log('----------------- Resetting Password -------------------');
  try {
    const { token, userId, password } = req.body;
    const parsedPassword = passwordParser.parse(password);
    const dbToken = await ResetToken.findOne({ user: userId }).lean();
    if (!dbToken) {
      throw new HTTPError('No reset token found', 404);
    }
    await verifyResetPasswordToken(token, dbToken.token, dbToken.updatedAt);
    const hashedPassword = await bcrypt.hash(parsedPassword, 10);
    const result = await User.findByIdAndUpdate(
      userId,
      { $set: { password: hashedPassword } },
      { new: true }
    );
    if (!result) {
      throw new HTTPError('Could not set password.', 500);
    }
    await ResetToken.findByIdAndDelete(dbToken._id);
    res.status(200).send('Successfully updated password');
  } catch (error) {
    handleError(error, res);
  }
};

export const token = async (req: Request, res: Response) => {
  console.log('---------------- Issuing access token -----------------');
  try {
    const refreshToken = req.body.token;
    if (!refreshToken) {
      throw new HTTPError('Invalid request: token missing', 404);
    }
    const tokenPayload = verifyRefreshToken(refreshToken);
    const userId = tokenPayload.sub;
    if (!userId) {
      throw new HTTPError('Invalid refresh token', 404);
    } else {
      const response = await Token.findOne({ user: userId }).lean();
      const dbRefreshToken = response?.token.find((dbToken) => bcrypt.compare(refreshToken, dbToken));
      // const dbRefreshToken = response?.token[0];
      if (!dbRefreshToken) {
        throw new HTTPError('Unauthorized', 401);
      }
      const accessToken = generateAccessToken(userId);
      res.status(200).json({ accessToken: accessToken });
    }
  } catch (error) {
    handleError(error, res);
  }
};
