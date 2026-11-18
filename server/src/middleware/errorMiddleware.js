
export function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    data: null,
  });
}

export function errorHandler(err, req, res, next) {
  console.error('[API ERROR]', {
    message: err.message,
    method: req.method,
    url: req.originalUrl,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // MongoDB duplicate key
  if (err.code === 11000) {
    status = 409;
    message = 'A record with this information already exists.';
  }

  // Mongoose validation
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ');
  }

  // Invalid MongoDB ObjectId
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid resource ID.';
  }

  // Invalid JSON body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    status = 400;
    message = 'Invalid JSON request body.';
  }

  // Do not expose internal errors in production.
  if (status >= 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal server error.';
  }

  return res.status(status).json({
    success: false,
    message,
    ...(err.extra || {}),
    data: null,
    ...(process.env.NODE_ENV === 'development'
      ? { stack: err.stack }
      : {}),
  });
}
