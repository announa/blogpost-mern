import dotenv from 'dotenv';
import express from 'express';
import mongoose, { MongooseError } from 'mongoose';
import productsRoutes from './routes/products.route';
import cors from 'cors';
import multer from 'multer';


dotenv.config();

const app = express();
const upload = multer();


app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use('/api/products', productsRoutes);

app.get('/', (req, res) => {
  res.send('Server running');
});

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
