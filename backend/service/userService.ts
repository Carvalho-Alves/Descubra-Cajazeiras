// userservice.ts

import { HydratedDocument, Types } from 'mongoose';
import { z } from 'zod';
import neo4j from 'neo4j-driver';

import { loginSchema, registerSchema } from '../validations/uservalidation';
import { User, IUser } from '../models/user';

// --- Tipagem do usuário público (sem senha) ---
export type PublicUser = Omit<IUser, 'senha'>;

// --- Configuração do Neo4j ---
const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'sua_senha'
  )
);

// --- SERVIÇO DE REGISTRO ---
type CreateUserInput = z.infer<typeof registerSchema>;
type LoginUserInput = z.infer<typeof loginSchema>;

export const createUserService = async (
  input: CreateUserInput
): Promise<HydratedDocument<IUser>> => {
  const session = driver.session();
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

    await session.run(
      `MERGE (u:User {userId: $userId})
       ON CREATE SET u.email = $email, u.nome = $nome, u.foto = $foto, u.role = $role`,
      { userId: newUser._id.toString(), email: newUser.email, nome: newUser.nome, foto: newUser.foto || '', role: newUser.role }
    );

    return newUser;
  } finally {
    await session.close();
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
  const session = driver.session();
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

    if (setClause) {
      await session.run(
        `MATCH (u:User {userId: $userId}) 
         SET ${setClause}`,
        neo4jUpdateProps
      );
    }
    
    return updatedUser;
  } finally {
    await session.close();
  }
};

// --- SERVIÇO DE DELETAR ---
export const deleteUserService = async (id: string) => {
  const session = driver.session();
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      const error: any = new Error('Usuário não encontrado.');
      error.statusCode = 404;
      throw error;
    }

    await session.run(
      `MATCH (u:User {userId: $userId}) DETACH DELETE u`,
      { userId: id }
    );

    return { message: 'Usuário deletado com sucesso.' };
  } finally {
    await session.close();
  }
};

// --- SERVIÇO DE BUSCAR TODOS ---
export const findUsersService = async () => {
  const users = (await User.find()) as HydratedDocument<IUser>[];

  const session = driver.session();
  try {
    const result = await session.run(`MATCH (u:User) RETURN u LIMIT 100`);
    const neo4jNodes = result.records.map(record => record.get('u').properties);

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
    await session.close();
  }
};

// --- SERVIÇO DE BUSCAR POR ID ---
export const findUserService = async (id: string) => {
  const mongoUser = (await User.findById(id)) as HydratedDocument<IUser> | null;

  if (!mongoUser) return null;

  const session = driver.session();
  try {
    const neo4jNodeResult = await session.run(
      `MATCH (u:User {userId: $userId}) RETURN u`,
      { userId: mongoUser._id.toString() }
    );

    const userObject = mongoUser.toObject();

    const neo4jNode = neo4jNodeResult.records[0]
      ? neo4jNodeResult.records[0].get('u').properties
      : null;

    return {
      ...userObject,
      neo4jNode,
    };
  } finally {
    await session.close();
  }
};