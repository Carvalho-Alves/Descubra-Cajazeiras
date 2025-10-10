import { HydratedDocument, Types } from "mongoose";
import { getNeo4jDriver } from "../database/neo4j";

import { Evento, IEvento } from "../models/evento";
import {
  createEventoSchema,
  updateEventoSchema,
  CreateEventoInput,
  UpdateEventoInput,
} from "../validations/eventovalidation";

const driver = getNeo4jDriver();

export const createEvento = async (
  input: CreateEventoInput,
  usuarioId: string
): Promise<HydratedDocument<IEvento>> => {
  const session = driver.session();
  try {
    const parsed = createEventoSchema.parse(input);
    const evento = await Evento.create({
      ...parsed,
      usuario: new Types.ObjectId(usuarioId),
    });

    const latitude = evento.localizacao?.latitude ?? null;
    const longitude = evento.localizacao?.longitude ?? null;

    // Converte o objeto Date para uma string ISO
    const dataString = evento.data ? evento.data.toISOString() : null;

    await session.run(
      `MERGE (u:User {userId: $userId})
       CREATE (s:Evento {
          eventoId: $eventoId,
          nome: $nome,
          descricao: $descricao,
          data: $data,
          horario: $horario,
          imagem: $imagem,
          latitude: $latitude,
          longitude: $longitude
       })
       MERGE (u)-[:OFERECE]->(s)`,
      {
        userId: usuarioId,
        eventoId: evento.id.toString(),
        nome: evento.nome,
        descricao: evento.descricao,
        data: dataString,
        horario: evento.horario,
        imagem: evento.imagem,
        latitude: latitude,
        longitude: longitude,
      }
    );

    return evento;
  } catch (error) {
    throw error;
  } finally {
    await session.close();
  }
};

export const listEvento = async (): Promise<HydratedDocument<IEvento>[]> => {
  const eventos = await Evento.find().populate("usuario", "nome email");
  return eventos as HydratedDocument<IEvento>[];
};

export const getEventoById = async (id: string) => {
  const evento = await Evento.findById(id).populate("usuario", "nome email");
  return evento;
};

export const updateEvento = async (
  id: string,
  usuarioId: string,
  input: UpdateEventoInput
) => {
  const session = driver.session();
  try {
    const parsed = updateEventoSchema.parse(input);
    const updatedEvento = await Evento.findOneAndUpdate(
      { _id: id, usuario: new Types.ObjectId(usuarioId) },
      { ...parsed },
      { new: true, runValidators: true }
    );

    if (!updatedEvento) {
      const error: any = new Error("Evento não encontrado ou operação não permitida.");
      error.statusCode = 404;
      throw error;
    }

    // Extrai latitude e longitude para a atualização
    const latitude = updatedEvento.localizacao?.latitude ?? null;
    const longitude = updatedEvento.localizacao?.longitude ?? null;
    
    await session.run(
      `MATCH (s:Evento {eventoId: $eventoId})
       SET s.nome = $nome,
           s.descricao = $descricao,
           s.data = $data,
           s.horario = $horario,
           s.imagem = $imagem,
           s.latitude = $latitude,
           s.longitude = $longitude`,
      {
        eventoId: updatedEvento.id.toString(),
        nome: updatedEvento.nome,
        descricao: updatedEvento.descricao,
        data: updatedEvento.data,
        horario: updatedEvento.horario,
        imagem: updatedEvento.imagem,
        latitude: latitude,
        longitude: longitude,
      }
    );

    return updatedEvento;
  } finally {
    await session.close();
  }
};

export const deleteEvento = async (id: string, usuarioId: string) => {
  const session = driver.session();
  try {
    const deletedEvento = await Evento.findOneAndDelete({
      _id: id,
      usuario: new Types.ObjectId(usuarioId),
    });

    if (!deletedEvento) {
      const error: any = new Error("Evento não encontrado ou operação não permitida.");
      error.statusCode = 404;
      throw error;
    }

    await session.run(
      `MATCH (s:Evento {eventoId: $eventoId}) DETACH DELETE s`,
      { eventoId: id }
    );

    return { message: "Evento deletado com sucesso." };
  } finally {
    await session.close();
  }
};