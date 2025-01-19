import { MongooseError } from 'mongoose';
import { HTTPError } from '../class/HTTPError';
import { Response } from 'express';

export const handleError = (error: unknown, res: Response) => {
  console.error(error);
  if (error instanceof HTTPError) {
    res.status(error.statusCode).json({ error: { message: error.message } });
  } else if (error instanceof MongooseError) {
    res.status(500).json({ error: { message: error.message } });
  } else {
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};
