import { HydratedDocument, Types } from 'mongoose';
import { z } from 'zod';
import { getNeo4jDriver } from '../database/neo4j';

import { Servico, IServico } from '../models/servico';
import { createServicoSchema, updateServicoSchema } from '../validations/servicovalidation';

const driver = getNeo4jDriver();

type CreateServicoInput = z.infer<typeof createServicoSchema> & { usuarioId: string };
type UpdateServicoInput = z.infer<typeof updateServicoSchema>;

export const createServico = async (
  input: CreateServicoInput
): Promise<HydratedDocument<IServico>> => {
  const session = driver.session();
  try {
    const { usuarioId, ...dados } = input;
    const servico = await Servico.create({ ...dados, usuario: new Types.ObjectId(usuarioId) });

    await session.run(
      `MATCH (u:User {userId: $userId})
       CREATE (s:Servico {servicoId: $servicoId, titulo: $titulo})
       MERGE (u)-[:OFERECE]->(s)`,
      {
        userId: usuarioId,
        servicoId: servico._id.toString(),
        titulo: servico.titulo,
      }
    );

    return servico;
  } finally {
    await session.close();
  }
};

export const listServicos = async (): Promise<HydratedDocument<IServico>[]> => {
  const servicos = await Servico.find().populate('usuario', 'nome email');
  return servicos as HydratedDocument<IServico>[];
};

export const getServicoById = async (id: string) => {
  const servico = await Servico.findById(id).populate('usuario', 'nome email');
  return servico;
};

export const updateServico = async (id: string, usuarioId: string, input: UpdateServicoInput) => {
  const session = driver.session();
  try {
    const servico = await Servico.findById(id);
    if (!servico) {
      const error: any = new Error('Serviço não encontrado.');
      error.statusCode = 404;
      throw error;
    }
    if (servico.usuario.toString() !== usuarioId) {
      const error: any = new Error('Operação não permitida.');
      error.statusCode = 403;
      throw error;
    }

    if (input.titulo !== undefined) servico.titulo = input.titulo;
    if (input.descricao !== undefined) servico.descricao = input.descricao;
    if (input.categoria !== undefined) servico.categoria = input.categoria;
    if (input.preco !== undefined) servico.preco = input.preco;
    if (input.contato !== undefined) servico.contato = input.contato;

    await servico.save();

    await session.run(
      `MATCH (s:Servico {servicoId: $servicoId})
       SET s.titulo = $titulo`,
      { servicoId: id, titulo: servico.titulo }
    );

    return servico;
  } finally {
    await session.close();
  }
};

export const deleteServico = async (id: string, usuarioId: string) => {
  const session = driver.session();
  try {
    const servico = await Servico.findByIdAndDelete(id);
    if (!servico) {
      const error: any = new Error('Serviço não encontrado.');
      error.statusCode = 404;
      throw error;
    }
    if (servico.usuario.toString() !== usuarioId) {
      const error: any = new Error('Operação não permitida.');
      error.statusCode = 403;
      throw error;
    }

    await session.run(`MATCH (s:Servico {servicoId: $servicoId}) DETACH DELETE s`, { servicoId: id });

    return { message: 'Serviço deletado com sucesso.' };
  } finally {
    await session.close();
  }
};


