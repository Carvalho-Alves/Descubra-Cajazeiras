import { Request, Response, NextFunction } from 'express';
import {createEvento} from '../service/eventoService';

export const createEventoController = async (req: Request, res: Response, next: NextFunction) => {
  const usuarioId = req.userId as string;
  const body: any = { ...req.body };

  // Se veio arquivo, prioriza a URL pública do arquivo
  const imagemUrl = (req as any).file ? `/uploads/${(req as any).file.filename}` : undefined;
  if (imagemUrl) {
    body.imagem = imagemUrl;
  }

  // Converte latitude/longitude para número, caso venham como string
  if (typeof body.latitude === 'string' && body.latitude.trim() !== '') {
    const lat = Number(body.latitude);
    if (!Number.isNaN(lat)) body.latitude = lat;
  }
  if (typeof body.longitude === 'string' && body.longitude.trim() !== '') {
    const lon = Number(body.longitude);
    if (!Number.isNaN(lon)) body.longitude = lon;
  }

  // Se latitude/longitude válidos, monta objeto localizacao
  if (typeof body.latitude === 'number' && typeof body.longitude === 'number') {
    body.localizacao = { latitude: body.latitude, longitude: body.longitude };
  }

  const novoEvento = await createEvento(body, usuarioId);
  res.status(201).json(novoEvento);
};
