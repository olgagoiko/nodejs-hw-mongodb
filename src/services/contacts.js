import createHttpError from 'http-errors';
import { Contact } from '../db/models/contacts.js';

export const createNewContact = async (data) => {
  return Contact.create(data);
};

export const getContactById = async (id, userId) => {
  const contact = await Contact.findOne({ _id: id, userId });
  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }
  return contact;
};

export const updateContact = async (id, updateData, userId) => {
  const contact = await Contact.findOneAndUpdate(
    { _id: id, userId: userId },
    updateData,
    { new: true },
  );
  return contact;
};

export const deleteContact = async (id, userId) => {
  const contact = await Contact.findOneAndDelete({ _id: id, userId });
  return contact;
};
