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
  body('tipo')
    .isIn(['servico', 'evento'])
    .withMessage("tipo deve ser 'servico' ou 'evento'."),
  body('referenciaId')
    .isMongoId().withMessage('referenciaId inválido.'),
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
