import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export function handleValidation(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação.',
      errors: errors.array().map(e => {
        // express-validator types may expose 'param' or 'path' depending on version;
        // cast to any and prefer 'param', fallback to 'path' (which may be array or string)
        const rawField = (e as any).param ?? (e as any).path;
        const field = Array.isArray(rawField) ? rawField.join('.') : (rawField ?? '');
        return { field, message: e.msg };
      }),
    });
  }
  next();
}
