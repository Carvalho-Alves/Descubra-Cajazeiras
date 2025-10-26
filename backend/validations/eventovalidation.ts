import { z } from 'zod';

export const createEventoSchema = z.object({
    nome: z.string().min(1, "O nome é obrigatório."),
    descricao: z.string().optional(),
    data: z.string().min(1, "A data é obrigatória."),
    horario: z.string().optional(),
    local: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    // Aceita URL ou caminho local (ex.: /uploads/abc123)
    imagem: z.string().optional(),
});

export const updateEventoSchema = createEventoSchema.partial();

export type CreateEventoInput = z.infer<typeof createEventoSchema> & { usuarioId: string };
export type UpdateEventoInput = z.infer<typeof updateEventoSchema>;