import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { HTTPError } from '../class/HTTPError';
import { handleError } from '../helper/errorHandling';
import { updateUserInputParser } from '../helper/parameterParser';
import { User } from '../models/user.model';

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    console.log('userId:', userId);
    if (!userId) {
      throw new HTTPError('Unauthorized', 401);
    }
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new HTTPError('User not found', 404);
    }
    const { _id, password, ...userData } = user;
    res.status(200).json({ ...userData, id: _id });
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
    const user = await User.findByIdAndUpdate(userId, updateData, {
      returnDocument: 'after', // Return the updated document (use 'after' or 'before')
      fields: 'firstName lastName userName email _id', // Only include these fields in the returned document
    }).lean();
    console.log('user update result: ', user);
    if (!user) {
      throw new HTTPError('User could not be found and updated', 404);
    }
    const { _id, ...userData } = user;
    res.status(200).json({ ...userData, id: _id });
  } catch (error) {
    handleError(error, res);
  }
};
