import { ObjectId } from 'bson';
import { Request, Response } from 'express';
import { Model, MongooseError } from 'mongoose';
import { v4 as uuid4 } from 'uuid';
import { Image } from '../models/image.model';
import { Post } from '../models/post.model';
import { HTTPError } from '../class/HTTPError';
import { handleError } from '../helper/errorHandling';
import { User } from '../models/user.model';

type UnwrapModel<T> = T extends Model<infer U> ? U : never;
type IPost = UnwrapModel<typeof Post>;
type IImage = { _id: ObjectId; name: string; contentType: string; file: Buffer };
type IAuthor = UnwrapModel<typeof User> & { _id: ObjectId };
type PostWithImageAndAuthor = Omit<IPost, 'image' | '_id' | 'author'> & {
  _id: ObjectId;
  image: IImage | null | undefined;
  author: IAuthor;
};
type IUpdatePostData = Omit<IPost, 'image'> & { image: IPost['image'] | 'null' };

const mapPost = (post: PostWithImageAndAuthor) => {
  const image = post?.image?.file?.toString('base64');
  const { _id: authorId, userName } = post.author;
  const { _id, ...postCopy } = post;
  if (!post.image) {
    return {
      ...postCopy,
      id: _id,
      author: { userName, id: authorId },
      image: null,
    };
  } else {
    const { _id: imageId, ...imageCopy } = post.image;
    return {
      ...postCopy,
      id: _id,
      author: { userName, id: authorId },
      image: {
        ...imageCopy,
        id: imageId,
        data: `data:${postCopy?.image?.contentType};base64,${image}`,
      },
    };
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = (await Post.find({})
      .sort({ createdAt: -1 })
      .lean()
      .populate([
        'image',
        { path: 'author', select: '_id, userName' },
      ])) as unknown as PostWithImageAndAuthor[];
    const mappedPosts = posts.map((post) => mapPost(post));
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
    const post = (await Post.findById(id)
      .lean()
      .populate(['image', { path: 'author', select: '_id, userName' }])) as unknown as PostWithImageAndAuthor;
    if (!post) {
      console.error(`Post with id ${id} could not be found`);
      res.status(404).json({ message: `Post with id ${id} could not be found` });
    } else {
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
  const extension = fileName.split('.').pop();
  const contentType = image.mimetype;
  const createdImage = await Image.create({
    name: `${uuid4()}.${extension}`,
    contentType,
    file: image.buffer,
  });
  console.log(`Image successfully created:\n ${createdImage}`);
  return createdImage;
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    let imageId = null;
    const image = req.file;
    if (image) {
      const createdImage = await createImage(image);
      imageId = createdImage._id;
      console.log(`Image successfully created:\n ${createdImage}`);
    }
    const { _id, ...post } = await Post.create({ ...req.body, image: imageId, author: userId });
    console.log(`Post successfully created:\n ${post}`);
    res.status(200).json({ id: _id, post });
  } catch (error) {
    handleError(error, res);
  }
};

const updatePostData = async (id: ObjectId, data: IUpdatePostData, userId: string) => {
  const updatedPost = await Post.findOneAndUpdate({ _id: id, author: userId }, data, { new: true });
  console.log('updated post: ', updatedPost);
  if (!updatedPost) {
    throw new HTTPError(`Post with id ${id} could not be found and updated`, 404);
  }
  const { _id, ...post } = updatedPost;
  return { id: _id, post };
};  

const updateImage = async (id: ObjectId, file: Express.Multer.File) => {
  const updatedImage = await Image.findByIdAndUpdate(id, file, { new: true });
  console.log('updated image: ', updatedImage);
  if (!updatedImage) {
    throw new HTTPError(`Image with id ${id} could not be found and updated`, 404);
  }
  return updatedImage;
};

const updatePostImage = async (
  imageId: ObjectId | null | undefined,
  postImageData: ObjectId | 'null' | null | undefined,
  imageFile?: Express.Multer.File
) => {
  let createdImageId = null;
  if (postImageData && postImageData === 'null') {
    postImageData = null;
  }
  if (imageId && imageFile) {
    await updateImage(imageId, imageFile);
  }
  if (!imageId && imageFile) {
    createdImageId = (await createImage(imageFile))._id;
  }
  if (imageId && postImageData === null) {
    await deleteImage(imageId);
  }
  if (createdImageId) {
    postImageData = createdImageId;
  }
  return postImageData;
};

const deleteImage = async (id: ObjectId) => {
  const deletedImage = await Post.findByIdAndDelete(id);
  console.log('deleted image: ', deletedImage);
  return deletedImage;
};

export const updatePost = async (req: Request, res: Response) => {
  const postData = req.body as IUpdatePostData;
  const { id } = req.params;
  const imageUpdateFile = req.file;
  try {
    const currentPost = await Post.findOne({ _id: id, author: req.userId });
    if (!currentPost) {
      throw new HTTPError(`Post with id ${id} could not be found for this user`, 404);
    }
    const postImageData = await updatePostImage(currentPost.image?._id, postData.image, imageUpdateFile);
    postData.image = postImageData;
    const post = await updatePostData(id as unknown as ObjectId, postData, req.userId);
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
