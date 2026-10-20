import { ZodError } from 'zod';
import { fail } from '../utils/apiResponse.js';

export function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return fail(res, 'Validation failed', 422, { errors: err.flatten() });
      }
      next(err);
    }
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return fail(res, 'Invalid query', 422, { errors: err.flatten() });
      }
      next(err);
    }
  };
}