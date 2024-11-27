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

router.get('/', ctrlWrapper(getAllContacts));
router.get('/:id', ctrlWrapper(getContactById));
router.post('/', jsonParser, ctrlWrapper(createContactController));
router.patch('/:id', jsonParser, ctrlWrapper(updateContactController));
router.delete('/:id', ctrlWrapper(deleteContactController));

export default router;
