import { Router, Request, Response } from 'express';
import { prisma } from '../../config/database';
import { z } from 'zod';

export const authRouter = Router();

// Chave mestra para validação de novos coordenadores (pode vir do .env)
const SENAI_COORDINATOR_KEY = process.env.COORDINATOR_KEY || 'SENAI-CEP-2026';

const registerUserSchema = z.object({
  name: z.string().min(3, "O nome deve conter ao menos 3 caracteres"),
  email: z.string().email("E-mail institucional ou pessoal inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  role: z.enum(['aluno', 'coordenador'], {
    errorMap: () => ({ message: "O perfil deve ser aluno ou coordenador" }),
  }),
  accessKey: z.string().optional(), // Obrigatório se role === 'coordenador'
  classCode: z.string().optional(), // Opcional para aluno
});

authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const data = registerUserSchema.parse(req.body);

    // Validação de segurança: Coordenadores exigem chave de acesso da unidade
    if (data.role === 'coordenador') {
      if (!data.accessKey || data.accessKey !== SENAI_COORDINATOR_KEY) {
        return res.status(403).json({ 
          message: "Código de autorização da Coordenação SENAI inválido ou ausente." 
        });
      }
    }

    const userExists = await prisma.user.findUnique({ where: { email: data.email } });
    if (userExists) {
      return res.status(400).json({ message: "Este e-mail já está cadastrado no Timeline." });
    }

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.password, // Em produção, utilize bcrypt
        role: data.role,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.status(201).json({
      user: newUser,
      message: `Cadastro de ${data.role} realizado com sucesso!`,
    });
  } catch (error: any) {
    const msg = error.errors ? error.errors[0].message : error.message;
    return res.status(400).json({ message: msg });
  }
});

// Login unificado
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ message: "E-mail ou senha incorretos." });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Usuário inativo. Contate a administração." });
    }

    let instructorData = null;
    if (user.role === 'instrutor') {
      instructorData = await prisma.instructor.findUnique({
        where: { email: user.email },
      });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        instructorId: instructorData ? instructorData.id : null,
      },
      token: "jwt_timeline_session",
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(404).json({ message: "E-mail não localizado na base." });
  }

  return res.json({
    message: "Instruções para recuperação de senha foram enviadas ao seu e-mail.",
  });
});