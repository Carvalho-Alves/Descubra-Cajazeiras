import { z } from "zod";

// 🔹 Normalização de role
const roleTransform = z.preprocess((val) => {
  if (typeof val === 'string') {
    const raw = val.trim();
    const upper = raw.toUpperCase();
    if (upper === 'USER' || upper === 'TURISTA') return 'Turista';
    if (upper === 'ADMIN' || upper === 'ADMINISTRADOR' || upper === 'ORGANIZER' || upper === 'ORGANIZADOR') return 'Admin';
    if (raw === 'Turista' || raw === 'Admin') return raw;
  }
  return val;
}, z.enum(['Admin', 'Turista'], { message: "O role deve ser 'Admin' ou 'Turista'." }));

// 🔹 Campos comuns
const credenciaisSchema = {
  email: z.string().email({ message: "Email inválido." }),
  role: roleTransform.optional(),
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

// 🔹 Atualização (admin/geral)
export const adminEditUserSchema = z.object({
  nome: z.string().min(2, { message: "O nome deve ter no mínimo 2 caracteres." }).optional(),
  email: z.string().email({ message: "Email inválido." }).optional(),
  senha: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres." }).optional(),
  role: roleTransform.optional(),
  foto: z.string().optional(),
});

// 🔹 Tipos
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
