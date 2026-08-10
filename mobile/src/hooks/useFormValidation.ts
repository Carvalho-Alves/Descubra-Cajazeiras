import { useCallback } from 'react';
import * as yup from 'yup';

// Schema de validação para Login/Cadastro
export const authSchema = yup.object().shape({
  nome: yup.string().when('isRegister', {
    is: true,
    then: (schema) => schema.required('Nome é obrigatório').min(3, 'Mínimo 3 caracteres'),
    otherwise: (schema) => schema.notRequired(),
  }),
  email: yup
    .string()
    .required('Email é obrigatório')
    .email('Email inválido'),
  senha: yup
    .string()
    .required('Senha é obrigatória')
    .min(6, 'Mínimo 6 caracteres'),
  confirmarSenha: yup.string().when('isRegister', {
    is: true,
    then: (schema) =>
      schema
        .required('Confirmação de senha é obrigatória')
        .oneOf([yup.ref('senha')], 'As senhas não conferem'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

// Schema de validação para Novo Serviço
export const servicoSchema = yup.object().shape({
  nome: yup
    .string()
    .required('Nome do serviço é obrigatório')
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  tipo_servico: yup.string().required('Tipo de serviço é obrigatório'),
  descricao: yup
    .string()
    .max(500, 'Máximo 500 caracteres'),
  telefone: yup
    .string()
    .matches(/^[\d\s\-()]*$/, 'Telefone inválido'),
  instagram: yup
    .string()
    .matches(/^[a-zA-Z0-9_.-]*$/, 'Instagram inválido'),
  latitude: yup
    .number()
    .required('Latitude é obrigatória')
    .min(-90, 'Latitude inválida')
    .max(90, 'Latitude inválida'),
  longitude: yup
    .number()
    .required('Longitude é obrigatória')
    .min(-180, 'Longitude inválida')
    .max(180, 'Longitude inválida'),
});

// Schema de validação para Novo Evento
export const eventoSchema = yup.object().shape({
  nome: yup
    .string()
    .required('Nome do evento é obrigatório')
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  descricao: yup
    .string()
    .max(500, 'Máximo 500 caracteres'),
  data: yup
    .date()
    .required('Data é obrigatória')
    .typeError('Data inválida'),
  hora: yup
    .string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida'),
  latitude: yup
    .number()
    .required('Latitude é obrigatória')
    .min(-90, 'Latitude inválida')
    .max(90, 'Latitude inválida'),
  longitude: yup
    .number()
    .required('Longitude é obrigatória')
    .min(-180, 'Longitude inválida')
    .max(180, 'Longitude inválida'),
});

// Hook customizado para validação
export function useFormValidation() {
  const validateField = useCallback(
    async (schema: yup.AnyObjectSchema, data: any) => {
      try {
        await schema.validate(data, { abortEarly: false });
        return { isValid: true, errors: {} };
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          const errors: { [key: string]: string } = {};
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
    []
  );

  return { validateField };
}
