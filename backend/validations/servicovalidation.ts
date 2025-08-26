import { z } from 'zod';

export const createServicoSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório."),
  descricao: z.string().optional(),
  tipo_servico: z.enum(["Hospedagem", "Alimentação/Lazer", "Ponto Turístico"]),
  categoria: z.string().optional(),
  contato: z.object({
    telefone: z.string().optional(),
    instagram: z.string().optional(),
  }).optional(),
  localizacao: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
  imagens: z.array(z.string()).optional(),
});

export const updateServicoSchema = createServicoSchema.partial();
export type CreateServicoInput = z.infer<typeof createServicoSchema> & { usuarioId: string };
export type UpdateServicoInput = z.infer<typeof updateServicoSchema>;