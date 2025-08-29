import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MongoServerError } from 'mongodb';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { Error as MongooseError } from 'mongoose';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // O console.error deve estar aqui no início para garantir que o erro seja sempre registrado.
  console.error('Ocorreu um erro:', err);

  const response = {
    success: false,
    message: err.message || 'Erro interno do servidor.',
    details: undefined as any,
  };

  // 1. Erro de validação do Zod (HTTP 400)
  if (err instanceof ZodError) {
    response.message = 'Erro de validação nos dados fornecidos.';
    response.details = err.flatten().fieldErrors;
    return res.status(400).json(response);
  }

  // 2. Erros específicos do JWT (HTTP 401 ou 403)
  if (err instanceof TokenExpiredError) {
    response.message = 'Token de autenticação expirado.';
    return res.status(401).json(response);
  }
  if (err instanceof JsonWebTokenError) {
    response.message = 'Token de autenticação inválido.';
    return res.status(403).json(response);
  }

  // 3. Erro de duplicação do MongoDB (HTTP 409)
  if (err instanceof MongoServerError && err.code === 11000) {
    const duplicatedField = Object.keys(err.keyValue)[0];
    response.message = `Já existe um registro com este ${duplicatedField}.`;
    response.details = { field: duplicatedField };
    return res.status(409).json(response);
  }

  // 4. Erro de validação do Mongoose (HTTP 400)
  if (err instanceof MongooseError.ValidationError) {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    response.message = `Erro de validação: ${errors.join('. ')}`;
    response.details = { validationErrors: errors };
    return res.status(400).json(response);
  }

  // Lida com erros lançados pelos serviços com mensagens personalizadas
  if (err.message.includes("Não autorizado")) {
    response.message = err.message;
    return res.status(403).json(response);
  }
  if (err.message.includes("não encontrada")) {
    response.message = err.message;
    return res.status(404).json(response);
  }

  // 5. Erros com código de status personalizado
  if (err.statusCode) {
    response.message = err.message;
    return res.status(err.statusCode).json(response);
  }

  // 6. Erro interno do servidor (HTTP 500)
  return res.status(500).json(response);
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  const error: any = new Error(`Não foi possível encontrar a rota: ${req.originalUrl}.`);
  error.statusCode = 404;
  next(error);
}