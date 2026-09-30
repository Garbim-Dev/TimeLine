import { Router, Request, Response } from 'express';
import { ScheduleService } from './schedule.service';
import { createScheduleSchema } from '../../common/validators/schedule.schema';

export const scheduleRouter = Router();

// 1. Listar todos os cronogramas (Coordenação)
scheduleRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const schedules = await ScheduleService.listAll();
    return res.json(schedules);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// 2. Portal do Professor: Cronograma do docente logado
scheduleRouter.get('/instructor/:id', async (req: Request, res: Response) => {
  try {
    const instructorId = Number(req.params.id);
    if (isNaN(instructorId)) {
      return res.status(400).json({ message: "ID do instrutor inválido." });
    }

    const schedules = await ScheduleService.listByInstructor(instructorId);
    return res.json(schedules);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// 3. Portal do Aluno: Consulta por Código da Turma (ex: APB.040.352)
scheduleRouter.get('/student/class/:classCode', async (req: Request, res: Response) => {
  try {
    const { classCode } = req.params;
    if (!classCode) {
      return res.status(400).json({ message: "Código da turma não informado." });
    }

    const scheduleData = await ScheduleService.listByClassCode(classCode.trim());
    if (!scheduleData) {
      return res.status(404).json({ message: "Nenhum cronograma localizado para a turma informada." });
    }

    return res.json(scheduleData);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// 4. Portal do Aluno: Consulta pelo ID da Turma vinculado ao usuário
scheduleRouter.get('/student/group/:groupId', async (req: Request, res: Response) => {
  try {
    const groupId = Number(req.params.groupId);
    if (isNaN(groupId)) {
      return res.status(400).json({ message: "Identificador de turma inválido." });
    }

    const schedules = await ScheduleService.listByClassGroupId(groupId);
    return res.json(schedules);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// 5. Criar novo agendamento com validação Zod
scheduleRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = createScheduleSchema.parse(req.body);
    const result = await ScheduleService.create(validatedData as any);
    return res.status(201).json(result);
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
    }
    return res.status(400).json({ message: error.message });
  }
});