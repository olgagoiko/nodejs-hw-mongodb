import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { User } from '../db/models/user.js';
import { Session } from '../db/models/session.js';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        createHttpError(401, 'Authorization header missing or invalid'),
      );
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(createHttpError(401, 'Token missing'));
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(createHttpError(401, 'Access token expired'));
      } else {
        return next(createHttpError(401, 'Invalid token'));
      }
    }
    const session = await Session.findOne({ userId: decoded.userId });
    if (!session) {
      return next(createHttpError(401, 'Session not found or invalid token'));
    }
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(createHttpError(401, 'User not found'));
    }
    req.user = user;
    next();
  } catch {
    next(createHttpError(401, 'Invalid token'));
  }
};
export default authenticate;
