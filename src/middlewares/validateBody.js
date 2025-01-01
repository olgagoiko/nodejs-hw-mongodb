import createHttpError from 'http-errors';

export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      next(
        createHttpError(
          400,
          error.details.map((err) => err.message).join(', '),
        ),
      );
    } else {
      next();
    }
  };
};
export default validateBody;
