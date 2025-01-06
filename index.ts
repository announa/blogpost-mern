import mongoose, { MongooseError } from 'mongoose';
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { Product } from './models/product.model';

dotenv.config();

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('What do you want?');
});

app.get('/api/products', async (req: express.Request, res: Response) => {
  try {
    const products = await Product.find({});
    console.log(products);
    res.status(200).json(products);
  } catch (error: unknown) {
    const mongooseError = error as MongooseError;

    res.status(500).json({ message: mongooseError.message });
  }
});

app.get('/api/product/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    console.log(id);
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ message: `Product with id ${id} could not be found` });
    }
    res.status(200).json(product);
  } catch (error: unknown) {
    const mongooseError = error as MongooseError;
    if ((mongooseError.message as string).includes('Cast to ObjectId failed for value')) {
      mongooseError.message = `Product with id ${id} could not be found`;
    }
    res.status(500).json({ message: mongooseError.message });
  }
});

app.post('/api/product', async (req: Request, res: Response) => {
  console.log(req.body);
  try {
    const product = await Product.create(req.body);
    console.log(product);
    console.log('Product successfully created');
    res.status(200).json(product);
  } catch (error: unknown) {
    const mongooseError = error as MongooseError;
    res.status(500).json({ message: mongooseError.message });
  }
});

app.put('/api/product/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndUpdate(id, req.body);
    if (!product) {
      res.status(404).json({ message: `Product with id ${id} could not be found` });
    }
    const updatedProduct = await Product.findById(id);
    res.status(200).json(updatedProduct);
  } catch (error: unknown) {
    const mongooseError = error as MongooseError;
    if ((mongooseError.message as string).includes('Cast to ObjectId failed for value')) {
      mongooseError.message = `Product with id ${id} could not be found`;
    }
    res.status(500).json({ message: mongooseError.message });
  }
});

app.delete('/api/product/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndDelete(id, req.body);
    if (!product) {
      res.status(404).json({ message: `Product with id ${id} could not be found` });
    }
    res.status(200).json({message: 'Product successfully deleted', product: product});
  } catch (error: unknown) {
    const mongooseError = error as MongooseError;
    if ((mongooseError.message as string).includes('Cast to ObjectId failed for value')) {
      mongooseError.message = `Product with id ${id} could not be found`;
    }
    res.status(500).json({ message: mongooseError.message });
  }
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
