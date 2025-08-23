import { z } from 'zod';

export const createServicoSchema = z.object({
  titulo: z.string().min(2),
  descricao: z.string().optional(),
  categoria: z.string().optional(),
  preco: z.number().min(0).optional(),
  contato: z.string().optional(),
});

export const updateServicoSchema = createServicoSchema.partial();


