import { HydratedDocument, Types } from "mongoose";
import { getNeo4jDriver } from "../database/neo4j";

import { Servico, IServico } from "../models/servico";
import {
  createServicoSchema,
  updateServicoSchema,
  CreateServicoInput,
  UpdateServicoInput,
} from "../validations/servicovalidation";

const driver = getNeo4jDriver();

export const createServico = async (
  input: CreateServicoInput,
  usuarioId: string
): Promise<HydratedDocument<IServico>> => {
  const session = driver.session();
  try {
    const parsed = createServicoSchema.parse(input);
    const servico = await Servico.create({
      ...parsed,
      usuario: new Types.ObjectId(usuarioId),
    });

    const latitude = servico.localizacao?.latitude ?? null;
    const longitude = servico.localizacao?.longitude ?? null;
    const categoria = servico.categoria ?? null;

    await session.run(
      `MERGE (u:User {userId: $userId})
       CREATE (s:Servico {
         servicoId: $servicoId,
         nome: $nome,
         descricao: $descricao,
         tipo_servico: $tipo_servico,
         categoria: $categoria,
         imagem: $imagem,
         latitude: $latitude,
         longitude: $longitude
       })
       MERGE (u)-[:OFERECE]->(s)`,
      {
        userId: usuarioId,
        servicoId: servico.id.toString(),
        nome: servico.nome,
        descricao: servico.descricao,
        tipo_servico: servico.tipo_servico,
        categoria: categoria,
        imagem: servico.imagem,
        latitude: latitude,
        longitude: longitude,
      }
    );

    return servico;
  } catch (error) {
    throw error;
  } finally {
    await session.close();
  }
};

export const listServicos = async (): Promise<HydratedDocument<IServico>[]> => {
  const servicos = await Servico.find().populate("usuario", "nome email");
  return servicos as HydratedDocument<IServico>[];
};

export const getServicoById = async (id: string) => {
  const servico = await Servico.findById(id).populate("usuario", "nome email");
  return servico;
};

export const updateServico = async (
  id: string,
  usuarioId: string,
  input: UpdateServicoInput
) => {
  const session = driver.session();
  try {
    const parsed = updateServicoSchema.parse(input);   
    const updatedServico = await Servico.findOneAndUpdate(
      { _id: id, usuario: new Types.ObjectId(usuarioId) },
      { ...parsed },
      { new: true, runValidators: true }
    );

    if (!updatedServico) {
      const error: any = new Error(
        "Serviço não encontrado ou operação não permitida."
      );
      error.statusCode = 404;
      throw error;
    }

    const latitude = updatedServico.localizacao.latitude ?? null;
    const longitude = updatedServico.localizacao.longitude ?? null;
    const categoria = updatedServico.categoria ?? null;

    await session.run(
      `MATCH (s:Servico {servicoId: $servicoId})
       SET s.nome = $nome,
           s.descricao = $descricao,
           s.tipo_servico = $tipo_servico,
           s.categoria = $categoria,
           s.imagem = $imagem,
           s.latitude = $latitude,
           s.longitude = $longitude`,
      {
        servicoId: updatedServico.id.toString(),
        nome: updatedServico.nome,
        descricao: updatedServico.descricao,
        tipo_servico: updatedServico.tipo_servico,
        categoria: categoria,
        imagem: updatedServico.imagem,
        latitude: latitude,
        longitude: longitude,
      }
    );

    return updatedServico;
  } finally {
    await session.close();
  }
};

export const deleteServico = async (id: string, usuarioId: string) => {
  const session = driver.session();
  try {
    const deletedServico = await Servico.findOneAndDelete({
      _id: id,
      usuario: new Types.ObjectId(usuarioId),
    });

    if (!deletedServico) {
      const error: any = new Error(
        "Serviço não encontrado ou operação não permitida."
      );
      error.statusCode = 404;
      throw error;
    }

    await session.run(
      `MATCH (s:Servico {servicoId: $servicoId}) DETACH DELETE s`,
      { servicoId: id }
    );

    return { message: "Serviço deletado com sucesso." };
  } finally {
    await session.close();
  }
};