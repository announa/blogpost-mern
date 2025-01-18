import express from 'express';
import { getAccessToken, login, register } from '../controllers/controllers';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/token', getAccessToken);

export default router;
