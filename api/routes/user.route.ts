import { Router } from 'express';
import { getUser } from '../controllers/user.controller';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

router.get('/', verifyToken, getUser);

export default router;
