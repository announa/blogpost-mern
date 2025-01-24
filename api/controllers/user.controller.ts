import { Request, Response } from 'express';
import { HTTPError } from '../class/HTTPError';
import { handleError } from '../helper/errorHandling';
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
    res.status(200).json({...userData, id: _id});
  } catch (error) {
    handleError(error, res);
  }
};
