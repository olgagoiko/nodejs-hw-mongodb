import bcrypt from 'bcrypt';
import { Session } from '../db/models/session.js';

export async function loginOrRegister(payload) {
  console.log(payload);
  const user = await Contact.findOne({ email: payload.email });

  if (user === null) {
    const password = await bcrypt.hash(
      crypto.randomBytes(30).toString('base64'),
      10,
    );

    const createdContact = await Contact.create({
      name: payload.name,
      email: payload.email,
      password,
    });

    return Session.create({
      userId: createdUser._id,
      accessToken: crypto.randomBytes(30).toString('base64'),
      refreshToken: crypto.randomBytes(30).toString('base64'),
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
      refreshTokenValidUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }

  await Session.deleteOne({ userId: user._id });

  return Session.create({
    userId: user._id,
    accessToken: crypto.randomBytes(30).toString('base64'),
    refreshToken: crypto.randomBytes(30).toString('base64'),
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
}
