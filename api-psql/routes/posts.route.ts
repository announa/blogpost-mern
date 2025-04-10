import express from 'express';
import { upload } from '../middleware/upload-file';
import { createPost, deletePost, getPost, getPosts, updatePost } from '../controllers/post.controller';
import { verifyToken } from '../middleware/verifyToken';

const router = express.Router();

router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', [verifyToken, upload.single('image')], createPost);
router.put('/:id', [verifyToken, upload.single('image')], updatePost);
router.delete('/:id', verifyToken, deletePost);

export default router;
