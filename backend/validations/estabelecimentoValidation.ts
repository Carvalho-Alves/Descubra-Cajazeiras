import { body, param, query, validationResult } from 'express-validator';

// Função de validação local
const validateRequest = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

// =================================================================
// VALIDAÇÕES PARA ESTABELECIMENTOS COMERCIAIS
// =================================================================

/**
 * Validações para criação de estabelecimento
 */
export const validateCreateEstabelecimento = [
  body('nome')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('tipo')
    .isIn(['Restaurante', 'Bar', 'Loja', 'Farmácia', 'Supermercado', 'Outros'])
    .withMessage('Tipo deve ser um dos valores permitidos'),
  
  body('categoria')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Categoria deve ter entre 2 e 50 caracteres'),
  
  body('descricao')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Descrição deve ter entre 10 e 500 caracteres'),
  
  body('endereco.rua')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Rua deve ter entre 2 e 100 caracteres'),
  
  body('endereco.numero')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Número deve ter entre 1 e 10 caracteres'),
  
  body('endereco.bairro')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Bairro deve ter entre 2 e 50 caracteres'),
  
  body('endereco.cep')
    .trim()
    .matches(/^\d{5}-?\d{3}$/)
    .withMessage('CEP deve estar no formato 00000-000'),
  
  body('localizacao.latitude')
    .isFloat({ min: -6.95, max: -6.83 })
    .withMessage('Latitude deve estar entre -6.95 e -6.83 (área de Cajazeiras)'),
  
  body('localizacao.longitude')
    .isFloat({ min: -38.62, max: -38.50 })
    .withMessage('Longitude deve estar entre -38.62 e -38.50 (área de Cajazeiras)'),
  
  body('contato.telefone')
    .trim()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .withMessage('Telefone deve estar no formato (00) 00000-0000'),
  
  body('contato.whatsapp')
    .optional()
    .trim()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .withMessage('WhatsApp deve estar no formato (00) 00000-0000'),
  
  body('contato.instagram')
    .optional()
    .trim()
    .matches(/^@?[a-zA-Z0-9._]{1,30}$/)
    .withMessage('Instagram deve ser um nome de usuário válido'),
  
  body('contato.facebook')
    .optional()
    .trim()
    .isURL()
    .withMessage('Facebook deve ser uma URL válida'),
  
  body('contato.site')
    .optional()
    .trim()
    .isURL()
    .withMessage('Site deve ser uma URL válida'),
  
  body('horario_funcionamento.*.abertura')
    .optional()
    .trim()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Horário de abertura deve estar no formato HH:MM'),
  
  body('horario_funcionamento.*.fechamento')
    .optional()
    .trim()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Horário de fechamento deve estar no formato HH:MM'),
  
  body('horario_funcionamento.*.fechado')
    .optional()
    .isBoolean()
    .withMessage('Campo fechado deve ser true ou false'),
  
  body('servicos')
    .optional()
    .isArray()
    .withMessage('Serviços deve ser um array'),
  
  body('servicos.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Cada serviço deve ter entre 2 e 50 caracteres'),
  
  body('pagamentos')
    .optional()
    .isArray()
    .withMessage('Pagamentos deve ser um array'),
  
  body('pagamentos.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Cada forma de pagamento deve ter entre 2 e 30 caracteres'),
  
  body('imagens')
    .optional()
    .isArray()
    .withMessage('Imagens deve ser um array'),
  
  body('imagens.*')
    .optional()
    .trim()
    .isURL()
    .withMessage('Cada imagem deve ser uma URL válida'),
  
  body('status')
    .optional()
    .isIn(['ativo', 'inativo', 'temporariamente_fechado'])
    .withMessage('Status deve ser um dos valores permitidos'),
  
  validateRequest
];

/**
 * Validações para atualização de estabelecimento
 */
export const validateUpdateEstabelecimento = [
  param('id')
    .isMongoId()
    .withMessage('ID deve ser um MongoDB ObjectId válido'),
  
  body('nome')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('tipo')
    .optional()
    .isIn(['Restaurante', 'Bar', 'Loja', 'Farmácia', 'Supermercado', 'Outros'])
    .withMessage('Tipo deve ser um dos valores permitidos'),
  
  body('categoria')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Categoria deve ter entre 2 e 50 caracteres'),
  
  body('descricao')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Descrição deve ter entre 10 e 500 caracteres'),
  
  body('endereco.rua')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Rua deve ter entre 2 e 100 caracteres'),
  
  body('endereco.numero')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Número deve ter entre 1 e 10 caracteres'),
  
  body('endereco.bairro')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Bairro deve ter entre 2 e 50 caracteres'),
  
  body('endereco.cep')
    .optional()
    .trim()
    .matches(/^\d{5}-?\d{3}$/)
    .withMessage('CEP deve estar no formato 00000-000'),
  
  body('localizacao.latitude')
    .optional()
    .isFloat({ min: -6.95, max: -6.83 })
    .withMessage('Latitude deve estar entre -6.95 e -6.83 (área de Cajazeiras)'),
  
  body('localizacao.longitude')
    .optional()
    .isFloat({ min: -38.62, max: -38.50 })
    .withMessage('Longitude deve estar entre -38.62 e -38.50 (área de Cajazeiras)'),
  
  body('contato.telefone')
    .optional()
    .trim()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .withMessage('Telefone deve estar no formato (00) 00000-0000'),
  
  body('contato.whatsapp')
    .optional()
    .trim()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .withMessage('WhatsApp deve estar no formato (00) 00000-0000'),
  
  body('contato.instagram')
    .optional()
    .trim()
    .matches(/^@?[a-zA-Z0-9._]{1,30}$/)
    .withMessage('Instagram deve ser um nome de usuário válido'),
  
  body('contato.facebook')
    .optional()
    .trim()
    .isURL()
    .withMessage('Facebook deve ser uma URL válida'),
  
  body('contato.site')
    .optional()
    .trim()
    .isURL()
    .withMessage('Site deve ser uma URL válida'),
  
  body('horario_funcionamento.*.abertura')
    .optional()
    .trim()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Horário de abertura deve estar no formato HH:MM'),
  
  body('horario_funcionamento.*.fechamento')
    .optional()
    .trim()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Horário de fechamento deve estar no formato HH:MM'),
  
  body('horario_funcionamento.*.fechado')
    .optional()
    .isBoolean()
    .withMessage('Campo fechado deve ser true ou false'),
  
  body('servicos')
    .optional()
    .isArray()
    .withMessage('Serviços deve ser um array'),
  
  body('servicos.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Cada serviço deve ter entre 2 e 50 caracteres'),
  
  body('pagamentos')
    .optional()
    .isArray()
    .withMessage('Pagamentos deve ser um array'),
  
  body('pagamentos.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Cada forma de pagamento deve ter entre 2 e 30 caracteres'),
  
  body('imagens')
    .optional()
    .isArray()
    .withMessage('Imagens deve ser um array'),
  
  body('imagens.*')
    .optional()
    .trim()
    .isURL()
    .withMessage('Cada imagem deve ser uma URL válida'),
  
  body('status')
    .optional()
    .isIn(['ativo', 'inativo', 'temporariamente_fechado'])
    .withMessage('Status deve ser um dos valores permitidos'),
  
  validateRequest
];

/**
 * Validações para busca por ID
 */
export const validateGetById = [
  param('id')
    .isMongoId()
    .withMessage('ID deve ser um MongoDB ObjectId válido'),
  
  validateRequest
];

/**
 * Validações para busca por tipo
 */
export const validateGetByType = [
  param('tipo')
    .isIn(['Restaurante', 'Bar', 'Loja', 'Farmácia', 'Supermercado', 'Outros'])
    .withMessage('Tipo deve ser um dos valores permitidos'),
  
  validateRequest
];

/**
 * Validações para busca por proximidade
 */
export const validateGetNearby = [
  query('lat')
    .isFloat({ min: -6.95, max: -6.83 })
    .withMessage('Latitude deve estar entre -6.95 e -6.83 (área de Cajazeiras)'),
  
  query('lng')
    .isFloat({ min: -38.62, max: -38.50 })
    .withMessage('Longitude deve estar entre -38.62 e -38.50 (área de Cajazeiras)'),
  
  query('raio')
    .optional()
    .isFloat({ min: 0.1, max: 50 })
    .withMessage('Raio deve estar entre 0.1 e 50 km'),
  
  validateRequest
];

/**
 * Validações para remoção
 */
export const validateRemove = [
  param('id')
    .isMongoId()
    .withMessage('ID deve ser um MongoDB ObjectId válido'),
  
  validateRequest
];
