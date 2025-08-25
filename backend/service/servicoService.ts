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

// Criar serviço
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

    await session.run(
      `MATCH (u:User {userId: $userId})
       CREATE (s:Servico {servicoId: $servicoId, nome: $nome})
       MERGE (u)-[:OFERECE]->(s)`,
      {
        userId: usuarioId,
        servicoId: servico._id.toString(),
        nome: servico.nome,
      }
    );

    return servico;
  } finally {
    await session.close();
  }
};

// Listar serviços
export const listServicos = async (): Promise<HydratedDocument<IServico>[]> => {
  const servicos = await Servico.find().populate("usuario", "nome email");
  return servicos as HydratedDocument<IServico>[];
};

// Buscar serviço por ID
export const getServicoById = async (id: string) => {
  const servico = await Servico.findById(id).populate("usuario", "nome email");
  return servico;
};

// Atualizar serviço
export const updateServico = async (
  id: string,
  usuarioId: string,
  input: UpdateServicoInput
) => {
  const session = driver.session();
  try {
    const servico = await Servico.findById(id);
    if (!servico) {
      const error: any = new Error("Serviço não encontrado.");
      error.statusCode = 404;
      throw error;
    }

    if (servico.usuario.toString() !== usuarioId) {
      const error: any = new Error("Operação não permitida.");
      error.statusCode = 403;
      throw error;
    }

    const parsed = updateServicoSchema.parse(input);

    if (parsed.nome !== undefined) servico.nome = parsed.nome;
    if (parsed.descricao !== undefined) servico.descricao = parsed.descricao;
    if (parsed.tipo_servico !== undefined)
      servico.tipo_servico = parsed.tipo_servico;
    if (parsed.categoria !== undefined) servico.categoria = parsed.categoria;
    if (parsed.contato !== undefined) servico.contato = parsed.contato;
    if (parsed.localizacao !== undefined)
      servico.localizacao = parsed.localizacao;
    if (parsed.imagens !== undefined) servico.imagens = parsed.imagens;

    await servico.save();

    await session.run(
      `MATCH (s:Servico {servicoId: $servicoId})
       SET s.nome = $nome`,
      { servicoId: id, nome: servico.nome }
    );

    return servico;
  } finally {
    await session.close();
  }
};

// Deletar serviço
export const deleteServico = async (id: string, usuarioId: string) => {
  const session = driver.session();
  try {
    const servico = await Servico.findById(id);
    if (!servico) {
      const error: any = new Error("Serviço não encontrado.");
      error.statusCode = 404;
      throw error;
    }

    if (servico.usuario.toString() !== usuarioId) {
      const error: any = new Error("Operação não permitida.");
      error.statusCode = 403;
      throw error;
    }

    await Servico.findByIdAndDelete(id);

    await session.run(
      `MATCH (s:Servico {servicoId: $servicoId}) DETACH DELETE s`,
      { servicoId: id }
    );

    return { message: "Serviço deletado com sucesso." };
  } finally {
    await session.close();
  }
};
