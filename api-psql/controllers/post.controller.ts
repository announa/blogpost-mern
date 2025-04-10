import { Request, Response } from 'express';
import { v4 as uuid4 } from 'uuid';
import { HTTPError } from '../class/HTTPError';
import { handleError } from '../helper/errorHandling';
import { pool } from '../helper/postgres-db/postgresDb';
import { Image, Post, PostgresUser } from '../types';
import { userInfo } from 'os';
import bcrypt from 'bcrypt';

type PostWithImageAndAuthor = Omit<Post, 'image' | 'author'> & {
  image: (Image & { data: string }) | null;
  author: PostgresUser;
};

type PostWithImage = Post & {
  image: number | null;
};

const mapPost = (post: PostWithImageAndAuthor) => {
  const { image, created_at, ...postCopy } = { ...post };

  return {
    ...postCopy,
    createdAt: created_at,
    image: image
      ? {
          ...image,
          data: `data:${image?.content_type};base64,${image?.file}`,
        }
      : null,
    author: {
      id: postCopy.author.id,
      userName: postCopy.author.user_name,
    },
  };
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const result = await pool.query<PostWithImageAndAuthor>(
      `
      SELECT posts.*,
        (
            SELECT json_build_object('id', images.id, 'name', images.name, 'file', encode(images.file, 'base64'), 'content_type', images.content_type)
            FROM images
            WHERE images.id = posts.image
    ) AS image,
     (
    SELECT json_build_object('id', users.id, 'user_name', users.user_name)
    FROM users
    WHERE users.id = posts.author
    ) AS author
      FROM posts
      ORDER BY created_at DESC`,
    );
    const posts = result.rows;
    const mappedPosts = posts.map((post) => mapPost(post));
    res.status(200).json(mappedPosts);
  } catch (error) {
    handleError(error, res);
  }
};

export const getPost = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query<PostWithImageAndAuthor>(
      `
      SELECT posts.*,
        (
            SELECT json_build_object('id', images.id, 'name', images.name, 'file', encode(images.file, 'base64'), 'content_type', images.content_type)
            FROM images
            WHERE images.id = posts.image
            ORDER BY images.id DESC
            LIMIT 1
    ) AS image,
     (
    SELECT json_build_object('id', users.id, 'user_name', users.user_name)
    FROM users
    WHERE users.id = posts.author
    LIMIT 1
    ) AS author
      FROM posts
      WHERE id = $1`,
      [id]
    );
    const post = result.rows[0];
    if (!post) {
      console.error(`Post with id ${id} could not be found`);
      res.status(404).json({ message: `Post with id ${id} could not be found` });
    } else {
      const mappedPost = mapPost(post);
      res.status(200).json(mappedPost);
    }
  } catch (error) {
    handleError(error, res);
  }
};

const createImage = async (image: Express.Multer.File) => {
  const fileName = image.originalname;
  const extension = fileName.split('.').pop();
  const contentType = image.mimetype;
  const file = image.buffer;
  const createdImage = await pool.query<Image>(
    'INSERT INTO images (name, content_type, file) VALUES ($1, $2, $3) RETURNING id',
    [`${uuid4()}.${extension}`, contentType, file]
  );
  console.log(`Image successfully created:\n ${JSON.stringify(createdImage.rows[0], null, 4)}`);
  return createdImage.rows[0] || null;
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    let imageId = null;
    const image = req.file;
    if (image) {
      const createdImage = await createImage(image);
      imageId = createdImage.id;
      if (!imageId) {
        throw new HTTPError('Image could not be created', 500);
      }
      console.log(`Image successfully created:\n ${createdImage}`);
    }
    const post = await pool.query(
      'INSERT INTO posts (title, summary, content, image, author) VALUES($1, $2, $3, $4, $5) RETURNING id',
      [req.body.title, req.body.summary, req.body.content, imageId, userId]
    );
    console.log(`Post successfully created:\n ${post}`);
    res.status(200).json(post.rows[0]);
  } catch (error) {
    handleError(error, res);
  }
};

const updatePostData = async (id: number, data: string, userId: number) => {
  console.log('update post data', userId);
  const result = await pool.query<Post>(
    `UPDATE posts SET ${data}
    WHERE id = $1 AND author = $2
    RETURNING *`,
    [id, userId]
  );
  const updatedPost = result.rows[0];
  if (!updatedPost) {
    throw new HTTPError(`Post with id ${id} could not be found and updated`, 404);
  }
  return updatedPost;
};

const updateImage = async (id: number, file: Express.Multer.File) => {
  const result = await pool.query<Image>('UPDATE images SET file = $2, WHERE id = $1 RETURNING *', [
    id,
    file.buffer,
  ]);
  const updatedImage = result.rows[0];
  if (!updatedImage) {
    throw new HTTPError(`Image with id ${id} could not be found and updated`, 404);
  }
  console.log('updated image: ', updatedImage);
  return updatedImage;
};

const updatePostImage = async (
  imageId: number | null | undefined,
  postImageData: number | 'null' | null | undefined,
  imageFile?: Express.Multer.File
) => {
  console.log('update post image');
  let createdImageId = null;
  if (postImageData && postImageData === 'null') {
    postImageData = null;
  }
  if (imageId && imageFile) {
    await updateImage(imageId, imageFile);
  }
  if (!imageId && imageFile) {
    createdImageId = await createImage(imageFile);
  }
  if (imageId && postImageData === null) {
    await deleteImage(imageId);
  }
  return createdImageId?.id ?? null;
};

const deleteImage = async (id: number) => {
  console.log('delete image');
  const deletedImage = await pool.query('DELETE FROM images WHERE id = $1 RETURNING *', [id]);
  console.log('deleted image: ', deletedImage);
  return deletedImage;
};

const generateRequestValueString = (
  data: Record<string, string | number | null | undefined>,
  imageId: number | null
) => {
  const dataArr = Object.entries(data);
  const dataStringToUpdate = dataArr.reduce((acc, [key, value], index) => {
    if (key !== 'id') {
      acc += `${key} = ${key === 'image' ? imageId : `${value}`},`;
    }

    return acc;
  }, '');
  const trimmedDataStringToUpdate = dataStringToUpdate.slice(0, -1);
  return trimmedDataStringToUpdate;
};

export const updatePost = async (req: Request, res: Response) => {
  const postData = req.body as Post & { image: number | null | undefined };
  const { id } = req.params;
  const imageUpdateFile = req.file;
  console.log('Get post');
  try {
    const result = await pool.query<PostWithImage>(
      `SELECT * FROM posts
      WHERE posts.id = $1 AND posts.author = $2`,
      [id, req.userId]
    );
    const currentPost = result.rows[0];
    if (!currentPost) {
      throw new HTTPError(`Post with id ${id} could not be found for this user`, 404);
    }
    const postImageId = await updatePostImage(currentPost.image, postData.image, imageUpdateFile);
    postData.image = postImageId;

    const dataStringToUpdate = generateRequestValueString(postData, postImageId);

    const post = await updatePostData(Number(id), dataStringToUpdate, Number(req.userId));
    res.status(200).json(post);
  } catch (error) {
    handleError(error, res);
  }
};

export const deletePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query<Post>('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);
    const post = result.rows[0];
    if (!post) {
      throw new HTTPError(`Post with id ${id} could not be found`, 404);
    } else {
      console.log(`Post with id ${id} successfully deleted`);
      res.status(200).json({ message: 'Post successfully deleted', post: post });
    }
  } catch (error) {
    handleError(error, res);
  }
};
