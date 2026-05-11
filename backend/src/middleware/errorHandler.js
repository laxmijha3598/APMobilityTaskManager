export function errorHandler(err, _req, res, _next) {
  const status = Number(err.statusCode) || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    error: {
      message,
    },
  });
}

