import { Request, Response } from 'express';
import { MongooseError } from 'mongoose';
import { Product } from '../models/product.model';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({});
    console.log(products);
    res.status(200).json(products);
  } catch (error: unknown) {
    const mongooseError = error as MongooseError;

    res.status(500).json({ message: mongooseError.message });
  }
};

export const getProduct = async (req: Request, res: Response) => {
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
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.create(req.body);
    console.log(`Product successfully created:\n ${product}`);
    res.status(200).json(product);
  } catch (error: unknown) {
    const mongooseError = error as MongooseError;
    res.status(500).json({ message: mongooseError.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
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
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndDelete(id, req.body);
    if (!product) {
      res.status(404).json({ message: `Product with id ${id} could not be found` });
    }
    res.status(200).json({ message: 'Product successfully deleted', product: product });
  } catch (error: unknown) {
    const mongooseError = error as MongooseError;
    if ((mongooseError.message as string).includes('Cast to ObjectId failed for value')) {
      mongooseError.message = `Product with id ${id} could not be found`;
    }
    res.status(500).json({ message: mongooseError.message });
  }
};
