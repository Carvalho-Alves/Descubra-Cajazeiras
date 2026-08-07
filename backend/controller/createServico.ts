import { Request, Response } from 'express';
import { createServico } from '../service/servicoService';

export const createServicoController = async (req: Request, res: Response) => {
  const usuarioId = (req as any).user?.sub || (req as any).userId;
  const imagemUrl = (req as any).file ? `/uploads/${(req as any).file.filename}` : undefined;
  
  let body: any = { ...req.body };
  
  try {
    if (typeof body.localizacao === 'string') {
      body.localizacao = JSON.parse(body.localizacao);
    }
    if (typeof body.contato === 'string') {
      body.contato = JSON.parse(body.contato);
    }
  } catch {}

  if (body.telefone) {
    body.contato = {
      ...body.contato,
      telefone: body.telefone
    };
  }

  if (imagemUrl) {
    body.imagens = Array.isArray(body.imagens) ? body.imagens.concat([imagemUrl]) : [imagemUrl];
  }
  
  const novoServico = await createServico(body, usuarioId);
  res.status(201).json(novoServico);
};