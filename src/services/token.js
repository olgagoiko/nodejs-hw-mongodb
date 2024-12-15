import jwt from 'jsonwebtoken';

export const createAccessToken = (user) => {
  const payload = { userId: user._id, email: user.email };
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

export const createRefreshToken = (user) => {
  const payload = { userId: user._id };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });
};
