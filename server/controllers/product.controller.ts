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
type IUpdateProductData = Omit<IProduct, 'image'> & {image: IProduct['image'] | 'null'}

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
      console.error(`Product with id ${id} could not be found`);
      res.status(404).json({ message: `Product with id ${id} could not be found` });
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

const createImage = async (image: Express.Multer.File) => {
  const fileName = image.originalname;
  console.log(fileName);
  const extension = fileName.split('.').pop();
  const contentType = image.mimetype;
  console.log('contentType', contentType);
  const createdImage = await Image.create({
    name: `${uuid4()}.${extension}`,
    contentType,
    file: image.buffer,
  });
  console.log(`Image successfully created:\n ${createdImage}`);
  return createdImage
}

export const createProduct = async (req: Request, res: Response) => {
  console.log(`Product to add: ${JSON.stringify(req.body)}`);
  try {
    let imageId = null;
    const image = req.file
    if (image) {
      const createdImage = await createImage(image)
      imageId = createdImage._id;
      console.log(`Image successfully created:\n ${createdImage}`);
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

const updateProductData = async (id: ObjectId, data: IUpdateProductData, res: Response) => {
  const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true });
  console.log('updated product: ', updatedProduct)
  if (!updatedProduct) {
    res.status(404).json({ message: `Product with id ${id} could not be found and updated` });
  }
  return updatedProduct
}

const updateImage = async (id: ObjectId, file: Express.Multer.File, res: Response) => {
  console.log('Updating image')
  const updatedImage = await Image.findByIdAndUpdate(id, file, { new: true });
  console.log('updated image: ', updatedImage)
  if (!updatedImage) {
    res.status(404).json({ message: `Image with id ${id} could not be found and updated` });
  }
  return updatedImage;
};

const deleteImage = async (id: ObjectId, res: Response) => {
  console.log('Deleting image')
  const deletedImage = await Product.findByIdAndDelete(id);
  console.log('deleted image: ', deletedImage)
  // if (!deletedImage) {
  //   res.status(404).json({ message: `Image with id ${id} could not be found and deleted` });
  // }
  return deletedImage;
};

export const updateProduct = async (req: Request, res: Response) => {
  const data = req.body as IUpdateProductData;
  const { id } = req.params;
  const imageToUpdate = req.file;
  console.log(`Data to update: ${JSON.stringify(data, null, 4)}`);
  console.log(`Image to update: ${JSON.stringify(imageToUpdate, null, 4)}`);
  try {
    const currentProduct = await Product.findById(id);
    const currentImageId = currentProduct?.image?._id;
    let createdImageId = null
    console.log('currentProduct: ', currentProduct);
    if (data.image && data.image === 'null') {
      data.image = null;
    }
    if (currentImageId && imageToUpdate) {
      await updateImage(currentImageId, imageToUpdate, res);
    }
    if(!currentImageId && imageToUpdate){
      createdImageId = (await createImage(imageToUpdate))._id
    }
    if (currentImageId && data.image === null) {
      await deleteImage(currentImageId, res);
    }
    if (createdImageId){
      data.image = createdImageId
    }
    const product = await updateProductData(id as unknown as ObjectId, data, res)
    res.status(200).json(product);
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
