import dotenv from 'dotenv';
import express from 'express';
import mongoose, { MongooseError } from 'mongoose';
import productsRoutes from './routes/products.route';

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api/products', productsRoutes);

mongoose
  .connect(process.env.DB_CONNECTION_STRING as string)
  .then(() => {
    console.log('Connected to database');

    app.listen(3000, () => {
      console.log('App listening on port 3000');
    });
  })
  .catch((error: unknown) => {
    const mongooseError = error as MongooseError;
    console.log('Connection to database failed: ', mongooseError.message);
  });
