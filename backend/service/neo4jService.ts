import { getNeo4jDriver } from '../database/neo4j';

export async function criarNoLocal(localId: string, titulo: string) {
  const session = getNeo4jDriver().session();
  try {
    await session.run('CREATE (l:Local {id:$id, titulo:$titulo})', { id: localId, titulo });
  } finally {
    await session.close();
  }
}

export async function criarNoCategoria(categoriaId: string, nome: string) {
  const session = getNeo4jDriver().session();
  try {
    await session.run('CREATE (c:Categoria {id:$id, nome:$nome})', { id: categoriaId, nome });
  } finally {
    await session.close();
  }
}

export async function relacionarLocalCategoria(localId: string, categoriaId: string) {
  const session = getNeo4jDriver().session();
  try {
    await session.run('MATCH (l:Local {id:$localId}), (c:Categoria {id:$categoriaId}) MERGE (l)-[:PERTENCE_A]->(c)', { localId, categoriaId });
  } finally {
    await session.close();
  }
}
