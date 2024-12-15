import express from 'express';
import {
  registerUser,
  loginUser,
  refreshSession,
  logout,
} from '../controllers/auth.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';

const router = express.Router();

router.post('/register', ctrlWrapper(registerUser));
router.post('/login', ctrlWrapper(loginUser));
router.post('/refresh', ctrlWrapper(refreshSession));
router.post('/logout', ctrlWrapper(logout));

export default router;
