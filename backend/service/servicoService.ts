import { HydratedDocument, Types } from "mongoose";
import { getNeo4jDriver } from "../database/neo4j";

import { Servico, IServico } from "../models/servico";
import {
  createServicoSchema,
  updateServicoSchema,
  CreateServicoInput,
  UpdateServicoInput,
} from "../validations/servicovalidation";

let driver: any = null;
try {
  driver = getNeo4jDriver();
} catch {
  driver = null; // Neo4j desabilitado
}

export const createServico = async (
  input: CreateServicoInput,
  usuarioId: string
): Promise<HydratedDocument<IServico>> => {
  const session = driver ? driver.session() : { run: async () => {}, close: async () => {} } as any;
  try {
    const parsed = createServicoSchema.parse(input);
    const imagensArr = Array.isArray((parsed as any).imagens) ? (parsed as any).imagens : [];
    const { imagens, ...rest } = parsed as any;
    const servico = await Servico.create({
      ...rest,
      imagem: imagensArr,
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
  const session = driver ? driver.session() : { run: async () => {}, close: async () => {} } as any;
  try {
    const parsed = updateServicoSchema.parse(input);
    const imagensArr = Array.isArray((parsed as any).imagens) ? (parsed as any).imagens : undefined;
    const { imagens, ...rest } = parsed as any;
    const updateDoc: any = { ...rest };
    if (imagensArr !== undefined) updateDoc.imagem = imagensArr;

    const updatedServico = await Servico.findOneAndUpdate(
      { _id: id, usuario: new Types.ObjectId(usuarioId) },
      updateDoc,
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
  const session = driver ? driver.session() : { run: async () => {}, close: async () => {} } as any;
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

export const searchServicos = async (q: string) => {
  const query = (q || '').trim();
  if (!query) return [];
  const results = await Servico.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .lean();
  if (results.length > 0) return results;

  // Fallback por regex (case-insensitive) quando o índice de texto não retorna itens
  const accentMap: Record<string, string> = {
    a: 'aàáâãäå',
    c: 'cç',
    e: 'eèéêë',
    i: 'iìíîï',
    n: 'nñ',
    o: 'oòóôõö',
    u: 'uùúûü',
    y: 'yÿ',
  };
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = escaped
    .split('')
    .map((ch) => {
      const base = ch.toLowerCase();
      if (accentMap[base]) {
        return `[${accentMap[base]}]`;
      }
      return ch;
    })
    .join('');
  const regex = new RegExp(pattern, 'i');
  const alt = await Servico.find({
    $or: [
      { nome: regex },
      { descricao: regex },
      { categoria: regex },
      { tipo_servico: regex },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  if (alt.length > 0) return alt;

  // Fallback 2: dividir por termos e exigir todos (AND), mas cada termo pode casar em qualquer campo (OR)
  const tokens = query.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    const tokenPatterns = tokens.map((t) => {
      const esc = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pat = esc
        .split('')
        .map((ch) => {
          const base = ch.toLowerCase();
          const accentMap: Record<string, string> = {
            a: 'aàáâãäå',
            c: 'cç',
            e: 'eèéêë',
            i: 'iìíîï',
            n: 'nñ',
            o: 'oòóôõö',
            u: 'uùúûü',
            y: 'yÿ',
          };
          return accentMap[base] ? `[${accentMap[base]}]` : ch;
        })
        .join('');
      return new RegExp(pat, 'i');
    });

    const andClauses = tokenPatterns.map((rgx) => ({
      $or: [
        { nome: rgx },
        { descricao: rgx },
        { categoria: rgx },
        { tipo_servico: rgx },
      ],
    }));

    const alt2 = await Servico.find({ $and: andClauses })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return alt2;
  }

  return alt;
};