import express from 'express';
import {
  getAllContacts,
  createContactController,
  updateContactController,
  deleteContactController,
  getContactByIdController,
} from '../controllers/contacts.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import { contactSchema, updateContactSchema } from '../validation/contacts.js';
import authenticate from '../middlewares/authenticate.js';
import upload from '../utils/multer.js';

const router = express.Router();
const jsonParser = express.json();

router.use(authenticate);

router.get('/', ctrlWrapper(getAllContacts));
router.get('/:id', isValidId, ctrlWrapper(getContactByIdController));
router.post(
  '/',
  upload.single('photo'),
  jsonParser,
  validateBody(contactSchema),
  ctrlWrapper(createContactController),
);
router.patch(
  '/:id',
  upload.single('photo'),
  jsonParser,
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(updateContactController),
);
router.delete('/:id', isValidId, ctrlWrapper(deleteContactController));

export default router;
