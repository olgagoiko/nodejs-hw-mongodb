import { Contact } from '../db/models/contacts.js';

export const createNewContact = async (data) => {
  return Contact.create(data);
};

export const updateContact = async (contactId, updateData) => {
  const updateContact = await Contact.findByIdUpdate(contactId, updateData, {
    new: true,
  });
  return updateContact;
};

export const deleteContact = async (contactId) => {
  const contact = await Contact.findByIdDelete(contactId);
  return contact;
};


