import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { HTTPError } from '../class/HTTPError';
import { getUserFromDb } from '../helper/dbRequests/getFromDb';
import { verifyFields } from '../helper/dbRequests/verifyFields';
import { generateResetEmailContent } from '../helper/email/generateResetEmailContent';
import { sendEmail } from '../helper/email/sendEmail';
import { handleError } from '../helper/errorHandling';
import { loginInputParser, passwordParser, registerInputParser } from '../helper/parameterParser';
import { pool } from '../helper/postgres-db/postgresDb';
import { generateAccessToken, generateRefreshToken } from '../helper/token/generateToken';
import { storeRefreshToken, storeResetToken } from '../helper/token/storeToken';
import { verifyRefreshToken, verifyResetPasswordToken } from '../helper/token/verifyToken';
import { RefreshToken, ResetToken, PostgresUser, ClientUser } from '../types';
import { mapUserData } from '../helper/dbRequests/mapUserData';

export type GetUserIdInput = {
  email: string;
  password: string;
};

export const login = async (req: Request, res: Response) => {
  console.log('---------------- Login -----------------');
  try {
    const loginInformation = loginInputParser.parse(req.body);
    const user = await getUserFromDb(loginInformation);
    const mappedUser = mapUserData(user) as ClientUser;
    console.log('USER: ', mappedUser);
    const accessToken = generateAccessToken(mappedUser.id);
    const refreshToken = generateRefreshToken(mappedUser.id);
    if (!accessToken || !refreshToken) {
      throw new HTTPError('Internal server error', 500);
    }
    await storeRefreshToken(refreshToken.token, mappedUser.id);
    res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken, data: mappedUser });
  } catch (error) {
    handleError(error, res);
  }
};

export const logout = async (req: Request, res: Response) => {
  console.log('---------------- Logout -----------------');
  try {
    const userId = req.userId;
    const response = await pool.query<RefreshToken>(
      `DELETE FROM refresh_tokens
      WHERE user_id = $1 RETURNING *`,
      [userId]
    );
    console.log('Removed refresh tokens');
    res.status(200).send('Successfully logged out');
  } catch (error) {
    handleError(error, res);
  }
};

export const register = async (req: Request, res: Response) => {
  console.log('---------------- Registration -----------------');
  try {
    const { firstName, lastName, userName, email, password } = registerInputParser.parse(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Verifying fields');
    await verifyFields({ userName, email });
    console.log('Add user to DB');
    const result = await pool.query<PostgresUser>(
      `INSERT INTO users (first_name, last_name, user_name, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, user_name, email`,
      [firstName, lastName, userName, email, hashedPassword]
    );
    const newUser = result.rows[0];
    if (!newUser) {
      throw new HTTPError('Could not create new user', 500);
    }
    console.log('Successfully created new user');
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
    const response = await pool.query<{ id: string; email: string }>(
      'SELECT id, email FROM user WHERE email = $1',
      [email]
    );
    const user = response.rows[0];
    if (!user) {
      console.error(`No user found for the email ${email}`);
      res.status(200).send('A password reset link has been sent to the provided email if this email exists');
      return;
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    await storeResetToken(resetToken, user.id);
    const content = generateResetEmailContent(resetToken, user.id);
    sendEmail({
      to: email,
      subject: 'Reset password for blox @annaludewig.net',
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
    const tokenResponse = await pool.query<ResetToken>('SELECT token FROM reset_tokens WHERE user_id = $1', [
      userId,
    ]);
    const dbToken = tokenResponse.rows[0];
    if (!dbToken) {
      throw new HTTPError('No reset token found', 404);
    }
    await verifyResetPasswordToken(token, dbToken.token, dbToken.updated_at);
    const hashedPassword = await bcrypt.hash(parsedPassword, 10);
    const userResponse = await pool.query<{ id: string }>(
      `UPDATE user SET password = $2 WHERE id = $1 RETURNING id`,
      [userId, hashedPassword]
    );
    const updatedUser = userResponse.rows[0];
    if (!updatedUser) {
      throw new HTTPError('Could not set password.', 500);
    }
    await pool.query('DELETE FROM reset_tokens WHERE id = $1', [dbToken.id]);
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
      const response = await pool.query<RefreshToken>('SELECT * FROM refresh_tokens WHERE user_id = $1', [
        userId,
      ]);
      const dbRefreshToken = response?.rows[0].token.find((token) => bcrypt.compare(refreshToken, token));
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
