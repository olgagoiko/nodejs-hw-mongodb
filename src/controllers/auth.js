import createHttpError from 'http-errors';
import {
  createUser,
  loginUserService,
  logoutUserSession,
  refreshSessionTokens,
  resetPassword,
  requestResetToken,
} from '../services/auth.js';
import { loginSchema, registerSchema } from '../validation/auth.js';
import { Session } from '../db/models/session.js';
import { createAccessToken, createRefreshToken } from '../services/token.js';

export const registerUser = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      throw createHttpError(
        400,
        error.details.map((err) => err.message).join(', '),
      );
    }

    const { name, email, password } = req.body;

    const user = await createUser({ name, email, password });

    res.status(201).json({
      status: 'success',
      message: 'Successfully registered a user!',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    if (error.status === 409) {
      res.status(409).json({
        status: 'fail',
        message: error.message,
      });
    } else {
      next(error);
    }
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      throw createHttpError(
        400,
        error.details.map((err) => err.message).join(', '),
      );
    }
    if (!req.body.email || !req.body.password) {
      throw createHttpError(400, 'Email and password are required');
    }
    const { email, password } = req.body;
    const user = await loginUserService(email, password);
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    await Session.deleteOne({ userId: user._id });
    await new Session({
      userId: user._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
      refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }).save();
    res.cookie('refreshToken', refreshToken, { httpOnly: true });
    res.status(200).json({
      status: 'success',
      message: 'Successfully logged in an user!',
      data: { accessToken },
    });
  } catch (error) {
    if (error.status === 401) {
      res.status(401).json({ status: 'fail', message: error.message });
    } else {
      next(error);
    }
  }
};

export const refreshSession = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return next(createHttpError(401, 'No refresh token found'));
    }

    const session = await Session.findOne({ refreshToken });

    if (!session) {
      return next(createHttpError(401, 'Invalid refresh token'));
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await refreshSessionTokens(refreshToken);

    await Session.deleteOne({ _id: session._id });

    await new Session({
      userId: session.userId,
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
      refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }).save();

    res.cookie('refreshToken', newRefreshToken, { httpOnly: true });
    res.status(200).json({
      status: 'success',
      message: 'Successfully refreshed a session!',
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return next(createHttpError(401, 'No refresh token found'));
    }
    const session = await Session.findOne({ refreshToken });
    if (!session) {
      return next(createHttpError(401, 'Invalid session ID'));
    }
    await logoutUserSession(session._id, refreshToken);

    res.clearCookie('refreshToken');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const requestResetEmailController = async (req, res) => {
  await requestResetToken(req.body.email);
  res.json({
    message: 'Reset password email was successfully sent!',
    status: 200,
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);
  res.json({
    message: 'Password was successfully reset!',
    status: 200,
    data: {},
  });
};
