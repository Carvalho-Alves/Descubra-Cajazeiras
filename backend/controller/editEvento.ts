import { Request, Response, NextFunction } from 'express';
import { Evento } from '../models/evento';

export const editEventoController = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
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

  const eventoAtualizado = await Evento.findByIdAndUpdate(id, body, { new: true });

  if (!eventoAtualizado) {
    return res.status(404).json({ message: 'Evento não encontrado.' });
  }
  res.status(200).json(eventoAtualizado);
};