export const sendErrorResponse = (res, statusCode, message) => {
  return res.status(statusCode).send({
    success: false,
    message,
  });
};
