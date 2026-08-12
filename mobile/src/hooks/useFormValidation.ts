import { useCallback } from 'react';
import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup.string().required('Email é obrigatório').email('Email inválido'),
  senha: yup.string().required('Senha é obrigatória').min(6, 'Mínimo 6 caracteres'),
});

export const registerSchema = yup.object({
  nome: yup.string().required('Nome é obrigatório').min(3, 'Mínimo 3 caracteres'),
  email: yup.string().required('Email é obrigatório').email('Email inválido'),
  senha: yup.string().required('Senha é obrigatória').min(6, 'Mínimo 6 caracteres'),
  confirmarSenha: yup
    .string()
    .required('Confirmação de senha é obrigatória')
    .oneOf([yup.ref('senha')], 'As senhas não conferem'),
});

export const profileSchema = yup.object({
  nome: yup.string().required('Nome é obrigatório').min(3, 'Mínimo 3 caracteres'),
  email: yup.string().required('Email é obrigatório').email('Email inválido'),
});

export const servicoSchema = yup.object({
  nome: yup
    .string()
    .required('Nome do serviço é obrigatório')
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  tipo_servico: yup.string().required('Tipo de serviço é obrigatório'),
  descricao: yup.string().max(500, 'Máximo 500 caracteres'),
  telefone: yup.string().matches(/^[\d\s\-()]*$/, 'Telefone inválido'),
  instagram: yup.string().matches(/^[a-zA-Z0-9_.-]*$/, 'Instagram inválido'),
  latitude: yup
    .number()
    .typeError('Latitude é obrigatória')
    .required('Latitude é obrigatória')
    .min(-90, 'Latitude inválida')
    .max(90, 'Latitude inválida'),
  longitude: yup
    .number()
    .typeError('Longitude é obrigatória')
    .required('Longitude é obrigatória')
    .min(-180, 'Longitude inválida')
    .max(180, 'Longitude inválida'),
});

export const eventoFormSchema = yup.object({
  nome: yup
    .string()
    .required('Nome do evento é obrigatório')
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  descricao: yup.string().max(500, 'Máximo 500 caracteres'),
  dataInput: yup
    .string()
    .required('Data é obrigatória')
    .matches(/^(\d{2})\/(\d{2})\/(\d{4})$/, 'Use o formato DD/MM/AAAA'),
  horaInput: yup
    .string()
    .matches(/^$|^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida (HH:MM)'),
  latitude: yup
    .number()
    .typeError('Latitude é obrigatória')
    .required('Latitude é obrigatória'),
  longitude: yup
    .number()
    .typeError('Longitude é obrigatória')
    .required('Longitude é obrigatória'),
});

export function useFormValidation() {
  const validateField = useCallback(
    async (schema: yup.AnyObjectSchema, data: Record<string, unknown>) => {
      try {
        await schema.validate(data, { abortEarly: false });
        return { isValid: true, errors: {} as Record<string, string> };
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          const errors: Record<string, string> = {};
          error.inner.forEach((err) => {
            if (err.path) {
              errors[err.path] = err.message;
            }
          });
          return { isValid: false, errors };
        }
        return { isValid: false, errors: { general: 'Erro ao validar' } };
      }
    },
    [],
  );

  return { validateField };
}
