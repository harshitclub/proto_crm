export const handleInvalidRoute = (req, res, next) => {
  // Set appropriate status code
  res.status(404);

  // Send error message
  res.json({
    success: false,
    message: "Invalid API Route",
  });

  // Log the request details for debugging
  console.error(`Invalid route: ${req.method} ${req.originalUrl}`);

  // Call next middleware (if any) in the chain
  next();
};
