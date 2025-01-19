import { ObjectId } from 'bson';
import { Request, Response } from 'express';
import { Model, MongooseError } from 'mongoose';
import { v4 as uuid4 } from 'uuid';
import { Image } from '../models/image.model';
import { Post } from '../models/post.model';
import { HTTPError } from '../class/HTTPError';
import { handleError } from '../helper/errorHandling';

type UnwrapModel<T> = T extends Model<infer U> ? U : never;
type IPost = UnwrapModel<typeof Post>;
type IImage = { _id: ObjectId; name: string; contentType: string; file: Buffer };
type PostWithImage = Omit<IPost, 'image' | '_id'> & {
  _id: ObjectId;
  image: IImage | null | undefined;
};
type IUpdatePostData = Omit<IPost, 'image'> & { image: IPost['image'] | 'null' };

const getLogResult = (data: PostWithImage) =>
  `${JSON.stringify({
    ...data,
    image: data.image ? { ...data.image, file: JSON.stringify(data.image?.file).slice(0, 50) } : null,
  })}`;

const mapPost = (post: PostWithImage) => {
  const image = post?.image?.file?.toString('base64');
  const { _id, ...postCopy } = post;
  if (!post.image) {
    return {
      ...postCopy,
      id: _id,
      image: null,
    };
  } else {
    const { _id: _imageId, ...imageCopy } = post.image;
    return {
      ...postCopy,
      id: _id,
      image: {
        ...imageCopy,
        id: _imageId,
        data: `data:${postCopy?.image?.contentType};base64,${image}`,
      },
    };
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = (await Post.find({}).lean().populate('image')) as PostWithImage[];
    const mappedPosts = posts.map((post) => mapPost(post));
    console.log(`Posts loaded: ${mappedPosts.map((post) => post.id)}`);
    res.status(200).json(mappedPosts);
  } catch (error) {
    const mongooseError = error as MongooseError;
    console.error(mongooseError);
    res.status(500).json({ message: mongooseError.message });
  }
};

export const getPost = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    console.log(`Requested post: ${id}`);
    const post = (await Post.findById(id).lean().populate('image')) as PostWithImage;
    if (!post) {
      console.error(`Post with id ${id} could not be found`);
      res.status(404).json({ message: `Post with id ${id} could not be found` });
    } else {
      console.log(`Post loaded: ${getLogResult(post)}`);
      const mappedPost = mapPost(post);
      res.status(200).json(mappedPost);
    }
  } catch (error) {
    if (error instanceof MongooseError && error.message.includes('Cast to ObjectId failed for value')) {
      error = new HTTPError(`Post with id ${id} could not be found`, 404);
    }
    handleError(error, res);
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
  return createdImage;
};

export const createPost = async (req: Request, res: Response) => {
  console.log(`Post to add: ${JSON.stringify(req.body)}`);
  try {
    let imageId = null;
    const image = req.file;
    if (image) {
      const createdImage = await createImage(image);
      imageId = createdImage._id;
      console.log(`Image successfully created:\n ${createdImage}`);
    }
    const post = await Post.create({ ...req.body, image: imageId });
    console.log(`Post successfully created:\n ${post}`);
    res.status(200).json(post);
  } catch (error) {
    handleError(error, res);
  }
};

const updatePostData = async (id: ObjectId, data: IUpdatePostData, res: Response) => {
  const updatedPost = await Post.findByIdAndUpdate(id, data, { new: true });
  console.log('updated post: ', updatedPost);
  if (!updatedPost) {
    handleError(new HTTPError(`Post with id ${id} could not be found and updated`, 404), res);
  }
  return updatedPost;
};

const updateImage = async (id: ObjectId, file: Express.Multer.File, res: Response) => {
  console.log('Updating image');
  const updatedImage = await Image.findByIdAndUpdate(id, file, { new: true });
  console.log('updated image: ', updatedImage);
  if (!updatedImage) {
    handleError(new HTTPError(`Image with id ${id} could not be found and updated`, 404), res);
  }
  return updatedImage;
};

const deleteImage = async (id: ObjectId, res: Response) => {
  console.log('Deleting image');
  const deletedImage = await Post.findByIdAndDelete(id);
  console.log('deleted image: ', deletedImage);
  return deletedImage;
};

export const updatePost = async (req: Request, res: Response) => {
  const data = req.body as IUpdatePostData;
  const { id } = req.params;
  const imageToUpdate = req.file;
  console.log(`Data to update: ${JSON.stringify(data, null, 4)}`);
  console.log(`Image to update: ${JSON.stringify(imageToUpdate, null, 4)}`);
  try {
    const currentPost = await Post.findById(id);
    const currentImageId = currentPost?.image?._id;
    let createdImageId = null;
    console.log('currentPost: ', currentPost);
    if (data.image && data.image === 'null') {
      data.image = null;
    }
    if (currentImageId && imageToUpdate) {
      await updateImage(currentImageId, imageToUpdate, res);
    }
    if (!currentImageId && imageToUpdate) {
      createdImageId = (await createImage(imageToUpdate))._id;
    }
    if (currentImageId && data.image === null) {
      await deleteImage(currentImageId, res);
    }
    if (createdImageId) {
      data.image = createdImageId;
    }
    const post = await updatePostData(id as unknown as ObjectId, data, res);
    res.status(200).json(post);
  } catch (error) {
    if (error instanceof MongooseError && error.message.includes('Cast to ObjectId failed for value')) {
      error = new HTTPError(`Post with id ${id} could not be found`, 404);
    }
    handleError(error, res);
  }
};

export const deletePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const post = await Post.findByIdAndDelete(id, req.body);
    if (!post) {
      throw new HTTPError(`Post with id ${id} could not be found`, 404);
    } else {
      console.log(`Post with id ${id} successfully deleted`);
      const imageId = post?.image?._id;
      if (imageId) {
        const deletedImage = await Image.findByIdAndDelete(imageId);
        if (!deletedImage) {
          throw new HTTPError(`The post's image with id ${imageId} could not be found and deleted`, 404);
        }
        console.log(`Post image with id ${imageId} successfully deleted`);
      }
      res.status(200).json({ message: 'Post successfully deleted', post: post });
    }
  } catch (error) {
    if (error instanceof MongooseError && error.message.includes('Cast to ObjectId failed for value')) {
      error = new HTTPError(`Post with id ${id} could not be found`, 404);
    }
    handleError(error, res);
  }
};
