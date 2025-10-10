import {z} from 'zod'

export const createAvaliacaoSchema = z.object ({
  tipo: z.string().optional(),
  referenciaId: z.string().optional(),
  nota: z.number().min(1).max(5),
  comentario: z.string().optional()
})

export const updateAValiacaoSchema = createAvaliacaoSchema.partial();

export type CreateAvaliacaoInput = z.infer<typeof createAvaliacaoSchema> & { usuarioId: string };
export type UpdateAvaliacaoInput = z.infer<typeof updateAValiacaoSchema>;