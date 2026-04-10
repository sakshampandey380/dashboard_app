const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  if (process.env.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json({
    message: err.message || "Server error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

// eslint-disable-next-line no-unused-vars
const notFound = (req, res, next) => {
  res.status(404);
  throw new Error(`Route not found: ${req.originalUrl}`);
};

module.exports = {
  errorHandler,
  notFound,
};
