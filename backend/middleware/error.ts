import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function erroHandler(
  err: any, 
  _req: Request, 
  res: Response, 
  _next: NextFunction
) {
  
  console.error('Ocorreu um erro:', err);
  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ 
      message: 'Erro de validação.', 
      details: err.flatten().fieldErrors 
    });
  }

  return res.status(500).json({ message: 'Erro interno do servidor.' });

}