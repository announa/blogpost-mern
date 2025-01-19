import express from 'express';
import { upload } from '../middleware/upload-file';
import { createPost, deletePost, getPost, getPosts, updatePost } from '../controllers/post.controller';
import { verifyToken } from '../middleware/verifyToken';
import { login, logout, token, register } from '../controllers/auth.controller';

const router = express.Router();

router.post('/login', login);
router.post('/logout', verifyToken, logout);
router.post('/register', register);
router.post('/token', token);

export default router;
