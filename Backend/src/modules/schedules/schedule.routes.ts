import { Router, Request, Response } from 'express';
import { ScheduleService } from './schedule.service';
import { createScheduleSchema } from '../../common/validators/schedule.schema';

export const scheduleRouter = Router();

// Listar todos os cronogramas
scheduleRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const schedules = await ScheduleService.listAll();
    return res.json(schedules);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// Listar cronograma de um instrutor específico
scheduleRouter.get('/instructor/:id', async (req: Request, res: Response) => {
  try {
    const instructorId = Number(req.params.id);
    const schedules = await ScheduleService.listByInstructor(instructorId);
    return res.json(schedules);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// Criar novo agendamento com validação Zod
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