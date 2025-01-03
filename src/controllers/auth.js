import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import {
  createUser,
  loginUserService,
  logoutUserSession,
  refreshSessionTokens,
} from '../services/auth.js';
import { loginSchema, registerSchema } from '../validation/auth.js';
import { Session } from '../db/models/session.js';
import { createAccessToken, createRefreshToken } from '../services/token.js';
import { User } from '../db/models/user.js';
import { TEMPLATES_DIR } from '../constants/index.js';
import { sendEmail } from '../services/sendMail.js';

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
      status: 201,
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
        status: 409,
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
      status: 200,
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
      status: 200,
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

export const sendResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw createHttpError(400, 'Email is required');
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: '5m',
    });
    const resetLink = `${process.env.APP_DOMAIN}/reset-password?token=${token}`;

    const resetPasswordTemplatePath = path.join(
      TEMPLATES_DIR,
      'reset-password-email.html',
    );
    const templateSource = (
      await fs.readFile(resetPasswordTemplatePath)
    ).toString();
    const template = handlebars.compile(templateSource);
    const html = template({
      name: user.name,
      link: resetLink,
    });

    await sendEmail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset Password',
      html,
    });

    res.status(200).json({
      status: 200,
      message: 'Reset password email has been successfully sent.',
      data: {},
    });
  } catch (error) {
    if (error.responseCode === 550) {
      next(
        createHttpError(
          500,
          'Failed to send the email, please try again later.',
        ),
      );
    } else {
      next(error);
    }
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return next(createHttpError(401, 'Token is expired or invalid.'));
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return next(createHttpError(404, 'User not found!'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    await Session.deleteOne({ userId: user._id });

    res.status(200).json({
      status: 200,
      message: 'Password has been successfully reset.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
