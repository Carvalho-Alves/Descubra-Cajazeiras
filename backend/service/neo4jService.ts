import { getNeo4jDriver } from '../database/neo4j';

export async function criarNoLocal(localId: string, titulo: string) {
  let driver: any = null;
  try { driver = getNeo4jDriver(); } catch { driver = null; }
  const session = driver ? driver.session() : { run: async () => {}, close: async () => {} } as any;
  try {
    await session.run('CREATE (l:Local {id:$id, titulo:$titulo})', { id: localId, titulo });
  } finally {
    await session.close();
  }
}

export async function criarNoCategoria(categoriaId: string, nome: string) {
  let driver: any = null;
  try { driver = getNeo4jDriver(); } catch { driver = null; }
  const session = driver ? driver.session() : { run: async () => {}, close: async () => {} } as any;
  try {
    await session.run('CREATE (c:Categoria {id:$id, nome:$nome})', { id: categoriaId, nome });
  } finally {
    await session.close();
  }
}

export async function relacionarLocalCategoria(localId: string, categoriaId: string) {
  let driver: any = null;
  try { driver = getNeo4jDriver(); } catch { driver = null; }
  const session = driver ? driver.session() : { run: async () => {}, close: async () => {} } as any;
  try {
    await session.run('MATCH (l:Local {id:$localId}), (c:Categoria {id:$categoriaId}) MERGE (l)-[:PERTENCE_A]->(c)', { localId, categoriaId });
  } finally {
    await session.close();
  }
}
