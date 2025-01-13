import { ObjectId } from 'bson';
import { Request, Response } from 'express';
import { Model, MongooseError } from 'mongoose';
import { v4 as uuid4 } from 'uuid';
import { Image } from '../models/image.model';
import { Product } from '../models/product.model';

type UnwrapModel<T> = T extends Model<infer U> ? U : never;
type IProduct = UnwrapModel<typeof Product>;
type IImage = { _id: ObjectId; name: string; contentType: string; file: Buffer };
type ProductWithImage = Omit<IProduct, 'image' | '_id'> & {
  _id: ObjectId;
  image: IImage | null | undefined;
};

const getLogResult = (data: ProductWithImage) =>
  `${JSON.stringify({
    ...data,
    image: data.image ? { ...data.image, file: JSON.stringify(data.image?.file).slice(0, 50) } : null,
  })}`;

const mapProduct = (product: ProductWithImage) => {
  const image = product?.image?.file?.toString('base64');
  const { _id, ...productCopy } = product;
  const plainProduct = productCopy;
  if (!product.image) {
    return {
      ...productCopy,
      id: _id,
      image: null,
    };
  } else {
    const { _id: _imageId, ...imageCopy } = product.image;
    return {
      ...productCopy,
      id: _id,
      image: {
        ...imageCopy,
        id: _imageId,
        data: `data:${productCopy?.image?.contentType};base64,${image}`,
      },
    };
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = (await Product.find({}).lean().populate('image')) as ProductWithImage[];
    const mappedProducts = products.map((product) => mapProduct(product));
    console.log(`Products loaded: ${mappedProducts.map((product) => product.id)}`);
    res.status(200).json(mappedProducts);
  } catch (error: unknown) {
    const mongooseError = error as MongooseError;
    console.error(mongooseError);
    res.status(500).json({ message: mongooseError.message });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    console.log(`Requested product: ${id}`);
    const product = (await Product.findById(id).lean().populate('image')) as ProductWithImage;
    if (!product) {
      console.error(`Product with id ${id} could not be found`)
      res.status(404).json({ message: `Product with id ${id} could not be found`});
    } else {
      console.log(`Product loaded: ${getLogResult(product)}`);
      const mappedProduct = mapProduct(product);
      res.status(200).json(mappedProduct);
    }
  } catch (error: unknown) {
    const mongooseError = error as MongooseError;
    if ((mongooseError.message as string).includes('Cast to ObjectId failed for value')) {
      mongooseError.message = `Product with id ${id} could not be found`;
    }
    console.error(mongooseError);
    res.status(500).json({ message: mongooseError.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  console.log(`Product to add: ${JSON.stringify(req.body)}`);
  try {
    let imageId = null;
    if (req.file) {
      const fileName = req.file.originalname;
      console.log(fileName);
      const extension = fileName.split('.').pop();
      const contentType = req.file.mimetype;
      console.log('contentType', contentType);
      const image = await Image.create({
        name: `${uuid4()}.${extension}`,
        contentType,
        file: req.file.buffer,
      });
      imageId = image._id;
      console.log(`Image successfully created:\n ${image}`);
    }
    const product = await Product.create({ ...req.body, image: imageId });
    console.log(`Product successfully created:\n ${product}`);
    res.status(200).json(product);
  } catch (error: unknown) {
    const mongooseError = error as MongooseError;
    console.error(mongooseError);
    res.status(500).json({ message: mongooseError.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  // const upload = multer();
  // upload.none();
  const data = req.body;
  const { id } = req.params;
  console.log(`Data to update: ${JSON.stringify(data, null, 4)}`);
  console.log(`Image Data to update: ${typeof data.image}`);
  const imageToUpdate = req.file;
  console.log(`Image to update: ${JSON.stringify(imageToUpdate, null, 4)}`);
  try {
    const currentProduct = await Product.findById(id);
    console.log('currentProduct: ', currentProduct);
    if (data.image && data.image === 'null') {
      data.image = null;
    }
    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!product) {
      res.status(404).json({ message: `Product with id ${id} could not be found` });
    }
    if (currentProduct?.image?._id) {
      const deletedImage = await Product.findByIdAndDelete(currentProduct.image._id);
      if (!deletedImage) {
        res.status(404).json({ message: `Product with id ${id} could not be found` });
      }
    }
    console.log(`Product successfully updated:\n ${product}`);
    res.status(200).json({ message: 'Product successfully updated', product: product });
  } catch (error: unknown) {
    const mongooseError = error as MongooseError;
    console.error(mongooseError);
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
    } else {
      console.log(`Product with id ${id} successfully deleted`);
      const imageId = product?.image?._id;
      if (imageId) {
        const deletedImage = await Image.findByIdAndDelete(imageId);
        if (!deletedImage) {
          console.error(`The product's image with id ${imageId} could not be deleted`);
          res.status(404).json({ message: `The product's image with id ${imageId} could not be deleted` });
          return;
        }
        console.log(`Product image with id ${imageId} successfully deleted`);
      }
      res.status(200).json({ message: 'Product successfully deleted', product: product });
    }
  } catch (error: unknown) {
    const mongooseError = error as MongooseError;
    if ((mongooseError.message as string).includes('Cast to ObjectId failed for value')) {
      mongooseError.message = `Product with id ${id} could not be found`;
    }
    console.error(mongooseError);
    res.status(500).json({ message: mongooseError.message });
  }
};
