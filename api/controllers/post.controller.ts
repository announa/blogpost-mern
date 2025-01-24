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

const getLogResult = (data: PostWithImageAndAuthor) =>
  `${JSON.stringify({
    ...data,
    image: data.image ? { ...data.image, file: JSON.stringify(data.image?.file).slice(0, 50) } : null,
  })}`;

const mapPost = (post: PostWithImageAndAuthor) => {
  const image = post?.image?.file?.toString('base64');
  const {_id: authorId, userName} = post.author
  const { _id, ...postCopy } = post;
  if (!post.image) {
    return {
      ...postCopy,
      id: _id,
      author: {userName, id: authorId},
      image: null,
    };
  } else {
    const { _id: imageId, ...imageCopy } = post.image;
    return {
      ...postCopy,
      id: _id,
      author: {userName, id: authorId},
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
      .lean()
      .populate([
        'image',
        { path: 'author', select: '_id, userName' },
      ])) as unknown as PostWithImageAndAuthor[];
    console.log('posts result: ', posts);
    const mappedPosts = posts.map((post) => mapPost(post));
    console.log(`Posts loaded: ${JSON.stringify(mappedPosts, null, 4)}`);
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
    const post = (await Post.findById(id)
      .lean()
      .populate(['image', { path: 'author', select: '_id, userName' }])) as unknown as PostWithImageAndAuthor;
    console.log('post result: ', post);
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
    const userId = req.userId;
    let imageId = null;
    const image = req.file;
    if (image) {
      const createdImage = await createImage(image);
      imageId = createdImage._id;
      console.log(`Image successfully created:\n ${createdImage}`);
    }
    const post = await Post.create({ ...req.body, image: imageId, author: userId });
    console.log(`Post successfully created:\n ${post}`);
    res.status(200).json(post);
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
  return updatedPost;
};

const updateImage = async (id: ObjectId, file: Express.Multer.File) => {
  console.log('Updating image');
  const updatedImage = await Image.findByIdAndUpdate(id, file, { new: true });
  console.log('updated image: ', updatedImage);
  if (!updatedImage) {
    throw new HTTPError(`Image with id ${id} could not be found and updated`, 404);
  }
  return updatedImage;
};

// const updatePostImage = (imageId: ObjectId | null, data.image, imageUpdateFile) => {

// }

const deleteImage = async (id: ObjectId) => {
  console.log('Deleting image');
  const deletedImage = await Post.findByIdAndDelete(id);
  console.log('deleted image: ', deletedImage);
  return deletedImage;
};

export const updatePost = async (req: Request, res: Response) => {
  const data = req.body as IUpdatePostData;
  const { id } = req.params;
  const imageUpdateFile = req.file;
  console.log(`Data to update: ${JSON.stringify(data, null, 4)}`);
  console.log(`Image to update: ${JSON.stringify(imageUpdateFile, null, 4)}`);
  try {
    const currentPost = await Post.findOne({_id: id, author: req.userId});
    if (!currentPost) {
      throw new HTTPError(`Post with id ${id} could not be found and updated`, 404);
    }
    // const {} = updatePostImage(currentPost.image?._id, data.image, imageUpdateFile)
    const currentImageId = currentPost?.image?._id;
    let createdImageId = null;
    console.log('currentPost: ', currentPost);
    if (data.image && data.image === 'null') {
      data.image = null;
    }
    if (currentImageId && imageUpdateFile) {
      await updateImage(currentImageId, imageUpdateFile);
    }
    if (!currentImageId && imageUpdateFile) {
      createdImageId = (await createImage(imageUpdateFile))._id;
    }
    if (currentImageId && data.image === null) {
      await deleteImage(currentImageId);
    }
    if (createdImageId) {
      data.image = createdImageId;
    }
    const post = await updatePostData(id as unknown as ObjectId, data, req.userId);
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
