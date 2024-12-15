import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { User } from '../db/models/user.js';
import { Session } from '../db/models/session.js';

export const createUser = async ({ name, email, password }) => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createHttpError(409, 'Email in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return newUser;
  } catch (error) {
    if (error.code === 11000) {
      throw createHttpError(409, 'Email in use');
    }
    throw error;
  }
};

export const loginUserService = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Invalid email or password');
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid email or password');
  }
  return user;
};

export const refreshSessionTokens = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const userId = decoded.userId;
    const user = await User.findById(userId);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }
    const session = await Session.findOne({ userId, refreshToken });
    if (!session) {
      throw createHttpError(401, 'Invalid refresh token');
    }
    const newAccessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' },
    );
    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '30d' },
    );
    session.refreshToken = newRefreshToken;
    await session.save();
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw createHttpError(401, 'Refresh token expired');
    }
    throw createHttpError(401, 'Invalid refresh token');
  }
};

export const logoutUserSession = async (sessionId, refreshToken) => {
  const session = await Session.findOne({ _id: sessionId });
  if (!session) {
    throw createHttpError(404, 'Session not found');
  }
  if (session.refreshToken !== refreshToken) {
    throw createHttpError(401, 'Invalid refresh token');
  }
  await Session.deleteOne({ _id: sessionId });
};
