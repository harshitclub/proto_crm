export const sendErrorResponse = (res, statusCode, message) => {
  return res.status(statusCode).send({
    success: false,
    message,
  });
};

export const sendSuccessResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: true,
    message,
  });
};
