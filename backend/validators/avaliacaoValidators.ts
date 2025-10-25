import { body, param } from 'express-validator';

export const idParamValidator = [
  param('id').isMongoId().withMessage('ID inválido.'),
];

export const referenciaParamsValidator = [
  param('tipo')
    .isIn(['servico', 'evento'])
    .withMessage("tipo deve ser 'servico' ou 'evento'."),
  param('id').isMongoId().withMessage('ID de referência inválido.'),
];

export const createAvaliacaoValidator = [
  body('referencia')
    .isObject().withMessage('referencia é obrigatório.')
    .custom((v) => v && typeof v.tipo === 'string' && typeof v.id === 'string')
    .withMessage('referencia deve conter { tipo, id }.'),
  body('referencia.tipo')
    .isIn(['servico', 'evento'])
    .withMessage("referencia.tipo deve ser 'servico' ou 'evento'."),
  body('referencia.id')
    .isMongoId().withMessage('referencia.id inválido.'),
  body('nota')
    .isInt({ min: 1, max: 5 })
    .withMessage('nota deve ser um inteiro entre 1 e 5.'),
  body('comentario')
    .optional()
    .isString().isLength({ max: 1000 })
    .withMessage('comentario deve ter até 1000 caracteres.'),
];

export const updateAvaliacaoValidator = [
  body('nota')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('nota deve ser um inteiro entre 1 e 5.'),
  body('comentario')
    .optional()
    .isString().isLength({ max: 1000 })
    .withMessage('comentario deve ter até 1000 caracteres.'),
];
