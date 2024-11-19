import express from 'express';
import cors from 'cors';
import pino from 'pino';

import 'dotenv/config';
import { getAllContacts, getContactById } from './services/contacts.js';

const app = express();
const logger = pino();

app.use(cors());

app.use((req, res, next) => {
  logger.info(`${req.method},${req.url}`);
  next();
});

app.get('/contacts', async (req, res) => {
  try {
    const contacts = await getAllContacts();
    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  } catch (e) {
    res.status(500).json({ message: 'Server error', e });
  }
});
app.get('/contacts/:contactId', async (req, res) => {
  const { contactId } = req.params;
  try {
    const contact = await getContactById(contactId);
    if (!contact) {
      return res.status(404).json({
        message: 'Contact not found',
      });
    }
    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (e) {
    res.status(500).json({ message: 'Server error', e });
  }
});

app.use((req, res) => {
  res.status(404).json({
    message: 'Not found',
  });
});

export const setupServer = () => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
