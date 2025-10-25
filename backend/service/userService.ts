// userservice.ts

import { HydratedDocument, Types } from 'mongoose';
import { z } from 'zod';
// Neo4j opcional
import { getNeo4jDriver } from '../database/neo4j';

import { loginSchema, registerSchema } from '../validations/uservalidation';
import { User, IUser } from '../models/user';

// --- Tipagem do usuário público (sem senha) ---
export type PublicUser = Omit<IUser, 'senha'>;

// --- Helper: sessão Neo4j opcional ---
const neo4jEnabled = (process.env.NEO4J_ENABLED || 'false').toLowerCase() === 'true';
function getNeo4jSessionOrNull() {
  if (!neo4jEnabled) return null;
  try {
    const driver = getNeo4jDriver();
    return driver.session();
  } catch {
    return null;
  }
}

// --- SERVIÇO DE REGISTRO ---
type CreateUserInput = z.infer<typeof registerSchema>;
type LoginUserInput = z.infer<typeof loginSchema>;

export const createUserService = async (
  input: CreateUserInput
): Promise<HydratedDocument<IUser>> => {
  const session = getNeo4jSessionOrNull();
  try {
    const { nome, email, senha, foto, role } = input;

    const existingMongoUser = await User.findOne({ email });
    if (existingMongoUser) {
      const error: any = new Error('Um usuário com este e-mail já existe.');
      error.statusCode = 409;
      throw error;
    }

    const newUser = new User({ nome, email, senha, foto, role });
    await newUser.save();

    if (session) {
      try {
        await session.run(
          `MERGE (u:User {userId: $userId})
           ON CREATE SET u.email = $email, u.nome = $nome, u.foto = $foto, u.role = $role`,
          { userId: newUser._id.toString(), email: newUser.email, nome: newUser.nome, foto: newUser.foto || '', role: newUser.role }
        );
      } catch (e) {
        // Falha no Neo4j não deve quebrar o fluxo principal
        console.warn('Neo4j indisponível ao registrar usuário. Prosseguindo sem grafo.');
      }
    }

    return newUser;
  } finally {
    if (session) await session.close();
  }
};

export const loginUserService = async (
  input: LoginUserInput
): Promise<HydratedDocument<IUser>> => {
  const { email, senha } = input;

  const user = await User.findOne({ email }).select('+senha');
  if (!user) {
    const error: any = new Error('Credenciais inválidas.');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordCorrect = await user.comparePassword(senha);
  if (!isPasswordCorrect) {
    const error: any = new Error('Credenciais inválidas.');
    error.statusCode = 401;
    throw error;
  }

  return user;
};

// --- SERVIÇO DE ATUALIZAÇÃO ---
export const updateUserService = async (id: string, updateData: IUser): Promise<IUser | null> => {
  const session = getNeo4jSessionOrNull();
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      const error: any = new Error('Usuário não encontrado.');
      error.statusCode = 404;
      throw error;
    }

    const neo4jUpdateProps: { [key: string]: any } = { userId: id };
    let setClause = '';

    if (updateData.nome !== undefined) {
      setClause += 'u.nome = $nome, ';
      neo4jUpdateProps.nome = updateData.nome;
    }
    if (updateData.email !== undefined) {
      setClause += 'u.email = $email, ';
      neo4jUpdateProps.email = updateData.email;
    }
    if (updateData.foto !== undefined) {
      setClause += 'u.foto = $foto, ';
      neo4jUpdateProps.foto = updateData.foto;
    }
    if (updateData.role !== undefined) {
      setClause += 'u.role = $role, ';
      neo4jUpdateProps.role = updateData.role;
    }
    
    // Remove a vírgula extra no final da string
    setClause = setClause.slice(0, -2); 

    if (setClause && session) {
      try {
        await session.run(
          `MATCH (u:User {userId: $userId}) 
           SET ${setClause}`,
          neo4jUpdateProps
        );
      } catch {
        console.warn('Neo4j indisponível ao atualizar usuário. Prosseguindo sem grafo.');
      }
    }
    
    return updatedUser;
  } finally {
    if (session) await session.close();
  }
};

// --- SERVIÇO DE DELETAR ---
export const deleteUserService = async (id: string) => {
  const session = getNeo4jSessionOrNull();
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      const error: any = new Error('Usuário não encontrado.');
      error.statusCode = 404;
      throw error;
    }

    if (session) {
      try {
        await session.run(
          `MATCH (u:User {userId: $userId}) DETACH DELETE u`,
          { userId: id }
        );
      } catch {
        console.warn('Neo4j indisponível ao deletar usuário. Prosseguindo sem grafo.');
      }
    }

    return { message: 'Usuário deletado com sucesso.' };
  } finally {
    if (session) await session.close();
  }
};

// --- SERVIÇO DE BUSCAR TODOS ---
export const findUsersService = async () => {
  const users = (await User.find()) as HydratedDocument<IUser>[];

  const session = getNeo4jSessionOrNull();
  try {
    let neo4jNodes: any[] = [];
    if (session) {
      try {
        const result = await session.run(`MATCH (u:User) RETURN u LIMIT 100`);
        neo4jNodes = result.records.map(record => record.get('u').properties);
      } catch {
        console.warn('Neo4j indisponível ao listar usuários. Prosseguindo sem grafo.');
      }
    }

    const combinedUsers = users.map(mongoUser => {
      const userObject = mongoUser.toObject();

      const neo4jData = neo4jNodes.find(
        node => node.userId === userObject._id.toString()
      );

      return {
        ...userObject,
        neo4jData: neo4jData || null,
      };
    });

    return combinedUsers;
  } finally {
  if (session) await session.close();
  }
};

// --- SERVIÇO DE BUSCAR POR ID ---
export const findUserService = async (id: string) => {
  const mongoUser = (await User.findById(id)) as HydratedDocument<IUser> | null;

  if (!mongoUser) return null;

  const session = getNeo4jSessionOrNull();
  try {
    let neo4jNode: any = null;
    if (session) {
      try {
        const neo4jNodeResult = await session.run(
          `MATCH (u:User {userId: $userId}) RETURN u`,
          { userId: mongoUser._id.toString() }
        );
        neo4jNode = neo4jNodeResult.records[0]
          ? neo4jNodeResult.records[0].get('u').properties
          : null;
      } catch {
        console.warn('Neo4j indisponível ao buscar usuário. Prosseguindo sem grafo.');
      }
    }

    const userObject = mongoUser.toObject();

    return {
      ...userObject,
      neo4jNode,
    };
  } finally {
    if (session) await session.close();
  }
};