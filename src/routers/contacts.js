import express from 'express';
import {
  getAllContacts,
  getContactById,
  createContactController,
  updateContactController,
  deleteContactController,
} from '../controllers/contacts.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';

const router = express.Router();
const jsonParser = express.json();

router.get('/contacts', ctrlWrapper(getAllContacts));
router.get('/contacts:contactid', ctrlWrapper(getContactById));
router.post('/contacts', jsonParser, ctrlWrapper(createContactController));
router.patch(
  '/contacts:contactid',
  jsonParser,
  ctrlWrapper(updateContactController),
);
router.delete('/contacts:contactid', ctrlWrapper(deleteContactController));

export default router;
