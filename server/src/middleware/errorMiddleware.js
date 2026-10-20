export function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';
  console.error('[error]', err.message);
  res.status(status).json({
    success: false,
    message: isProd && status === 500 ? 'Internal server error' : err.message,
    ...(isProd ? {} : { stack: err.stack }),
  });
}