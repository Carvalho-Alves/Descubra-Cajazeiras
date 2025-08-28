import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MongoServerError } from 'mongodb'; // Importe o tipo de erro do MongoDB

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Ocorreu um erro:', err);

  // Erro de validação do Zod
  if (err instanceof ZodError) {
    return res.status(400).json({ 
      success: false,
      message: 'Erro de validação.', 
      details: err.flatten().fieldErrors 
    });
  }

  // Erro de duplicação do MongoDB (código 11000)
  if (err instanceof MongoServerError && err.code === 11000) {
    // Extrai a chave duplicada do erro (ex: email)
    const duplicatedField = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `Já existe um registro com este ${duplicatedField}.`,
      field: duplicatedField
    });
  }
  
  // Erros com código de status personalizado
  if (err.statusCode) {
    return res.status(err.statusCode).json({ 
      success: false,
      message: err.message 
    });
  }
  
  // Erro interno do servidor (catch-all)
  return res.status(500).json({ 
    success: false,
    message: 'Erro interno do servidor.',
    // Em produção, remova ou comente esta linha para não expor detalhes
    // details: err.message
  });
}