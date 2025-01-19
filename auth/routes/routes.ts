import express from 'express';
import { token, login, register } from '../controllers/controllers';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/token', token);

export default router;
