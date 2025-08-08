// Your controller code here
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

export const loginUser = async(req: Request, res: Response): Promise <void> => {
    const {email, senha} = req.body;

    if (!email || !senha){
        res.status(400).json({message:"Email ou Senha não encontrados no banco de dados!"})
        return;
    };
    try {
        
    } catch (e) {
        
    }
}

export async function createUser(req: Request, res: Response) {
    const {email, senha} = req.body;
}

export async function findUsers(req:Request, res: Response) {
    
}

export async function findUser(req:Request, res: Response) {
    
}

export async function deleteUser(req:Request, res: Response) {
    
}

export async function editUser(req:Request, res: Response) {
    
}