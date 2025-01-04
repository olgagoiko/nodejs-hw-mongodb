import express from 'express';
import {
  registerUser,
  loginUser,
  refreshSession,
  logout,
  sendResetEmail,
  resetPassword,
  getOAuthURLController,
  confirmOAuthController,
} from '../controllers/auth.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';
import {
  resetPasswordSchema,
  sendResetEmailSchema,
  confirmOAuthSchema,
} from '../validation/auth.js';
import { validateBody } from '../middlewares/validateBody.js';

const router = express.Router();
const jsonParser = express.json();

router.post('/register', ctrlWrapper(registerUser));
router.post('/login', ctrlWrapper(loginUser));
router.post('/refresh', ctrlWrapper(refreshSession));
router.post('/logout', ctrlWrapper(logout));
router.post(
  '/send-reset-email',
  jsonParser,
  validateBody(sendResetEmailSchema),
  ctrlWrapper(sendResetEmail),
);
router.post(
  '/reset-pwd',
  jsonParser,
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPassword),
);

router.get('/get-oauth-url', ctrlWrapper(getOAuthURLController));

router.post(
  '/confirm-oauth',
  jsonParser,
  validateBody(confirmOAuthSchema),
  ctrlWrapper(confirmOAuthController),
);

export default router;
