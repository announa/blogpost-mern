import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose, { MongooseError } from 'mongoose';
import authRoutes from './routes/auth.route';
import postsRoutes from './routes/posts.route';
import userRoutes from './routes/user.route';

dotenv.config();

const app = express();

mongoose
  .connect(process.env.DB_CONNECTION_STRING as string)
  .then(() => {
    console.log('Connected to database');
  })
  .catch((error: unknown) => {
    const mongooseError = error as MongooseError;
    console.log('Connection to database failed: ', mongooseError.message);
    process.exit();
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Server running');
});

// app.listen(3000, () => {
//   console.log('App listening on port 3000');
// });

module.exports = app
