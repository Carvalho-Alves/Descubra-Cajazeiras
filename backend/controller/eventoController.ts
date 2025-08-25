import { Request, Response } from 'express';
import { Evento } from '../models/evento'; 


const eventoController = {
  create: async (req: Request, res: Response) => {
    try {
      const novoEvento = new Evento(req.body);
      await novoEvento.save();
      res.status(201).json(novoEvento);
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      res.status(500).json({ message: 'Ocorreu um erro no servidor.' });
    }
  },

  findAll: async (req: Request, res: Response) => {
    try {
      const eventos = await Evento.find();
      res.status(200).json(eventos);
    } catch (error) {
      console.error("Erro ao listar eventos:", error);
      res.status(500).json({ message: 'Ocorreu um erro no servidor.' });
    }
  },

  findById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const evento = await Evento.findById(id);

      if (!evento) {
        return res.status(404).json({ message: 'Evento não encontrado.' });
      }
      res.status(200).json(evento);
    } catch (error) {
      console.error("Erro ao buscar evento:", error);
      res.status(500).json({ message: 'Ocorreu um erro no servidor.' });
    }
  },


  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const eventoAtualizado = await Evento.findByIdAndUpdate(id, req.body, { new: true });

      if (!eventoAtualizado) {
        return res.status(404).json({ message: 'Evento não encontrado.' });
      }
      res.status(200).json(eventoAtualizado);
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      res.status(500).json({ message: 'Ocorreu um erro no servidor.' });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const eventoDeletado = await Evento.findByIdAndDelete(id);

      if (!eventoDeletado) {
        return res.status(404).json({ message: 'Evento não encontrado.' });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar evento:", error);
      res.status(500).json({ message: 'Ocorreu um erro no servidor.' });
    }
  },
};

export default eventoController;