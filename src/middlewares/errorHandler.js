import createHttpError from 'http-errors';

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err instanceof createHttpError.HttpError) {
    res.status(err.status).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      data: err.message,
    });
  }
};

export default errorHandler;
