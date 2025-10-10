import { z } from "zod";

// 🔹 Campos comuns
const credenciaisSchema = {
  email: z.string().email({ message: "Email inválido." }),
  role: z.enum(['Organizador', 'Turista'], { message: "O role deve ser 'Organizador' ou 'Turista'."}).optional(),
  senha: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),
};

// 🔹 Registro
export const registerSchema = z.object({
  nome: z.string().min(2, { message: "O nome deve ter no mínimo 2 caracteres." }),
  foto: z.string().optional(),
  ...credenciaisSchema,
});

// 🔹 Login
export const loginSchema = z.object({
  ...credenciaisSchema,
});

// 🔹 Tipos
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
