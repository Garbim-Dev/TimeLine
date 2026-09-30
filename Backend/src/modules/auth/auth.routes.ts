import { Router, Request, Response } from 'express';
import { prisma } from '../../config/database';
import { z } from 'zod';

export const authRouter = Router();

// Chave mestra para validação de novos coordenadores
const SENAI_COORDINATOR_KEY = process.env.COORDINATOR_KEY || 'SENAI-CEP-2026';

const registerUserSchema = z.object({
  name: z.string().min(3, "O nome deve conter ao menos 3 caracteres"),
  email: z.string().email("E-mail institucional ou pessoal inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  role: z.enum(['aluno', 'professor', 'coordenador'], {
    errorMap: () => ({ message: "O perfil deve ser aluno, professor ou coordenador" }),
  }),
  accessKey: z.string().optional(), // Obrigatório para coordenador
  classCode: z.string().optional(), // Opcional ou recomendado para aluno
  registrationCode: z.string().optional(), // Opcional: matrícula do professor
});

// Cadastro de novos usuários
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const data = registerUserSchema.parse(req.body);

    // 1. Validação de segurança para coordenadores
    if (data.role === 'coordenador') {
      if (!data.accessKey || data.accessKey !== SENAI_COORDINATOR_KEY) {
        return res.status(403).json({ 
          message: "Código de autorização da Coordenação SENAI inválido ou ausente." 
        });
      }
    }

    // 2. Verificar se o e-mail já existe
    const userExists = await prisma.user.findUnique({ where: { email: data.email } });
    if (userExists) {
      return res.status(400).json({ message: "Este e-mail já está cadastrado no Timeline." });
    }

    let linkedInstructorId: number | null = null;
    let linkedClassGroupId: number | null = null;

    // 3. Se for professor, vincula ao registro de instrutor existente ou cria um novo
    if (data.role === 'professor') {
      const existingInstructor = await prisma.instructor.findFirst({
        where: {
          OR: [
            { email: data.email },
            ...(data.registrationCode ? [{ registrationCode: data.registrationCode }] : [])
          ]
        }
      });

      if (existingInstructor) {
        linkedInstructorId = existingInstructor.id;
      } else {
        // Se a coordenação ainda não cadastrou o instrutor na tabela, cria automaticamente
        const newInstructor = await prisma.instructor.create({
          data: {
            name: data.name,
            email: data.email,
            registrationCode: data.registrationCode || null,
          }
        });
        linkedInstructorId = newInstructor.id;
      }
    }

    // 4. Se for aluno e informou o código da turma, localiza e vincula
    if (data.role === 'aluno' && data.classCode) {
      const classGroup = await prisma.classGroup.findUnique({
        where: { classCode: data.classCode.trim() }
      });
      if (classGroup) {
        linkedClassGroupId = classGroup.id;
      }
    }

    // 5. Criação do usuário
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.password, // Em produção recomendável bcrypt
        role: data.role,
        instructorId: linkedInstructorId,
        classGroupId: linkedClassGroupId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        instructorId: true,
        classGroupId: true,
      },
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

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        instructor: true,
        classGroup: {
          include: {
            course: true
          }
        }
      }
    });

    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ message: "E-mail ou senha incorretos." });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Usuário inativo. Contate a administração." });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        instructorId: user.instructorId,
        instructor: user.instructor,
        classGroupId: user.classGroupId,
        classGroup: user.classGroup,
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