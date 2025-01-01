import Joi from 'joi';

export const contactSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().min(10).max(15).required(),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid('work', 'home', 'personal').required(),
  photo: Joi.string().optional(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(30),
  email: Joi.string().email(),
  phoneNumber: Joi.string().min(10).max(15),
  isFavourite: Joi.boolean(),
  photo: Joi.string().optional(),
  contactType: Joi.string().valid('work', 'home', 'personal'),
}).or('name', 'email', 'phoneNumber', 'isFavourite', 'contactType');
