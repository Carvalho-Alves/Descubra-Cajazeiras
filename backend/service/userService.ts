import { HydratedDocument, Types } from 'mongoose';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import neo4j from 'neo4j-driver';

import { loginSchema, registerSchema } from '../validations/uservalidation';
import { User, IUser } from '../models/user';

type UpdateUserInput = {
  nome?: string;
  email?: string;
  role?: 'USER' | 'ADMIN';
};

export type PublicUser = Omit<IUser, 'senha'>;

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'sua_senha'
  )
);

type CreateUserInput = z.infer<typeof registerSchema>;
type LoginUserInput = z.infer<typeof loginSchema>;

export const createUserService = async (
  input: CreateUserInput
): Promise<HydratedDocument<IUser>> => {
  const session = driver.session();
  try {
    const { nome, email, senha, foto } = input;

    const existingMongoUser = await User.findOne({ email });
    if (existingMongoUser) {
      const error: any = new Error('Um usuário com este e-mail já existe.');
      error.statusCode = 409;
      throw error;
    }

    const newUser = new User({ nome, email, senha, foto });
    await newUser.save();

    await session.run(
      `CREATE (u:User {userId: $userId, email: $email, nome: $nome, foto: $foto})`,
      { userId: newUser._id.toString(), email: newUser.email, nome: newUser.nome, foto: newUser.foto || '' }
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

export const updateUserService = async (id: string, updateData: Partial<IUser>): Promise<IUser | null> => {
  const session = driver.session();
  try {
    const user = await User.findById(id);
    if (!user) {
      const error: any = new Error('Usuário não encontrado.');
      error.statusCode = 404;
      throw error;
    }

    await session.run(
      `MATCH (u:User {userId: $userId}) 
       SET u.nome = $nome, u.email = $email`,
      { userId: id, nome: updateData.nome, email: updateData.email }
    );

    if (updateData.nome) user.nome = updateData.nome;
    if (updateData.email) user.email = updateData.email;
    if (updateData.role) user.role = updateData.role;

    await user.save();

    return user;
  } finally {
    await session.close();
  }
};

export const deleteUserService = async (id: string) => {
  const session = driver.session();
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
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

export const findUsersService = async () => {
  const users = (await User.find()) as HydratedDocument<IUser>[];

  const session = driver.session();
  try {
    const result = await session.run(`MATCH (u:User) RETURN u LIMIT 100`);
    const neo4jNodes = result.records.map(record => record.get('u').properties);

    const combinedUsers = users.map(mongoUser => {
      const userObject = mongoUser.toObject();
      delete userObject.senha;

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
    delete userObject.senha;

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
