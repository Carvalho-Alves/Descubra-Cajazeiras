import { z } from "zod";

const credenciaisSchema = {
  email: z.string().email({ message: "Email inválido." }),
  senha: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),
};

export const registerSchema = z.object({
  nome: z.string().min(2, { message: "O nome deve ter no mínimo 2 caracteres." }),
  foto: z.string().optional(),
  ...credenciaisSchema,
});

export const loginSchema = z.object({
  ...credenciaisSchema,
});

export const adminEditUserSchema = z.object({
  nome: z.string()
    .min(3, { message: "O nome deve ter no mínimo 3 caracteres." })
    .optional(),
  email: z.string()
    .email({ message: "Formato de e-mail inválido." })
    .optional(),
  role: z.enum(['admin', 'turista'], { message: "O role deve ser 'admin' ou 'turista'."})
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;