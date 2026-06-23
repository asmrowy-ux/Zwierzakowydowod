import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from './errorHandler';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Creates a validation middleware for the given Zod schema and request target.
 *
 * Usage:
 *   router.post('/pets', validate(createPetSchema, 'body'), handler)
 *   router.get('/pets', validate(listQuerySchema, 'query'), handler)
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req[target]);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        throw new ValidationError('Validation failed', errors);
      }

      // Replace target with parsed (and transformed/defaulted) data
      (req as any)[target] = result.data;
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        next(error);
      } else if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Convenience helpers
 */
export const validateBody = (schema: ZodSchema) => validate(schema, 'body');
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');
