import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { HTTPError } from '../class/HTTPError';
import { handleError } from '../helper/errorHandling';
import { updateUserInputParser } from '../helper/parameterParser';
import { pool } from '../helper/postgres-db/postgresDb';
import { PostgresUser } from '../types';
import { mapUserData } from '../helper/dbRequests/mapUserData';

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    console.log('userId:', userId);
    if (!userId) {
      throw new HTTPError('Unauthorized', 401);
    }
    const result = await pool.query<PostgresUser>('SELECT * FROM users WHERE id = $1', [userId]);
    const user = mapUserData(result.rows[0]);
    if (!user) {
      throw new HTTPError('User not found', 404);
    }
    const { password, ...userData } = user;
    res.status(200).json(userData);
  } catch (error) {
    handleError(error, res);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const routeSegments = req.originalUrl.split('/');
    const routeUserId = routeSegments[routeSegments.length - 1];
    if (!userId || userId !== routeUserId) {
      throw new HTTPError('Unauthorized', 401);
    }
    const updateData = updateUserInputParser.parse(req.body);
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateData.password = hashedPassword;
    }
    const result = await pool.query<PostgresUser>(
      `
      UPDATE users
      SET first_name = $2, last_name = $3, user_name = $4, email = $5, password = $6
      WHERE id = $1
      RETURNING first_name, last_name, user_name, email, id`,
      [
        userId,
        updateData.firstName,
        updateData.lastName,
        updateData.userName,
        updateData.email,
        updateData.password,
      ]
    );
    const user = result.rows[0];
    if (!user) {
      throw new HTTPError('User could not be found and updated', 404);
    }
    console.log('user update result: ', user);
    res.status(200).json(user);
  } catch (error) {
    handleError(error, res);
  }
};
