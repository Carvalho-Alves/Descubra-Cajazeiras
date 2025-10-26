import { Request, Response, NextFunction } from 'express';
import { createServicoSchema, updateServicoSchema } from '../validations/servicovalidation';
import * as servicoService from '../service/servicoService';

export const editServicoController = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  // Normaliza localizacao se vier como string JSON
  let body: any = { ...req.body };
  try {
    if (typeof body.localizacao === 'string') {
      body.localizacao = JSON.parse(body.localizacao);
    }
    if (typeof body.contato === 'string') {
      body.contato = JSON.parse(body.contato);
    }
  } catch {}
  // Adiciona imagem se enviada
  const imagemUrl = (req as any).file ? `/uploads/${(req as any).file.filename}` : undefined;
  if (imagemUrl) {
    body.imagens = Array.isArray(body.imagens) ? body.imagens.concat([imagemUrl]) : [imagemUrl];
  }
  const updateData = updateServicoSchema.parse(body);
  const usuarioId = (req as any).userId || (req as any).user?.sub;

  const servicoAtualizado = await servicoService.updateServico(id, usuarioId, updateData);
  res.status(200).json(servicoAtualizado);
};