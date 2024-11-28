import express from 'express';
import cors from 'cors';
import pino from 'pino';
import errorHandler from './middlewares/errorHandler.js';
import notFoundHandler from './middlewares/notFoundHandler.js';
import contactsRouter from './routers/contacts.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const logger = pino();

app.use((req, res, next) => {
  logger.info(`${req.method},${req.url}`);
  next();
});
app.use(cors());
app.use(express.json());
app.use('/contacts', contactsRouter);

app.use(errorHandler);
app.use(notFoundHandler);

export const setupServer = () => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
