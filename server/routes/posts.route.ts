import express from 'express';
import { upload } from '../middleware/upload-file';
import { createPost, deletePost, getPost, getPosts, updatePost } from '../controllers/post.controller';

const router = express.Router();


router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', upload.single('image'), createPost);
router.put('/:id', upload.single('image'), updatePost);
router.delete('/:id', deletePost);

export default router;
