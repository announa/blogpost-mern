import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/routes';
import cors from 'cors';
import mongoose, { MongooseError } from 'mongoose';

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use('/', authRoutes);

mongoose
  .connect(process.env.DB_CONNECTION_STRING as string)
  .then(() => {
    console.log('Connected to database');
    app.listen(4000, () => {
      console.log('app listening at port 4000');
    });
  })
  .catch((error: unknown) => {
    const mongooseError = error as MongooseError;
    console.log('Connection to database failed: ', mongooseError.message);
  });
