import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/routes';

dotenv.config();
const app = express();

app.use('/', authRoutes);

app.listen(4000, () => {
  console.log('app listening at port 4000');
});
