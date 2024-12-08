import express from 'express';
import cors from 'cors';
import pino from 'pino';
import 'dotenv/config';
import contactsRouter from './routers/contacts.js';
import errorHandler from './middlewares/errorHandler.js';
import notFoundHandler from './middlewares/notFoundHandler.js';

const app = express();
const logger = pino();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/contacts', contactsRouter);
app.use((req, res, next) => {
  logger.info(`${req.method},${req.url}`);
  next();
});
app.use(notFoundHandler);
app.use(errorHandler);

export const setupServer = () => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
