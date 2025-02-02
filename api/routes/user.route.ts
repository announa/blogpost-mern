import { Router } from 'express';
import { getUser, updateUser } from '../controllers/user.controller';
import { verifyToken } from '../middleware/verifyToken';
import multer from 'multer';

const router = Router();
const upload = multer();

router.get('/', verifyToken, getUser);
router.put('/:id', [verifyToken, upload.none()], updateUser);

export default router;
