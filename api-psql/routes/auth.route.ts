import express from 'express';
import {
  login,
  logout,
  register,
  requestResetPassword,
  resetPassword,
  token,
} from '../controllers/auth.controller';
import { verifyToken } from '../middleware/verifyToken';

const router = express.Router();

router.post('/login', login);
router.post('/logout', verifyToken, logout);
router.post('/register', register);
router.post('/request-reset-password', requestResetPassword);
router.put('/reset-password', resetPassword);
router.post('/token', token);

export default router;
