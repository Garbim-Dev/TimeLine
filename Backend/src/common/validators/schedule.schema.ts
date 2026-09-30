import { z } from 'zod';

export const createScheduleSchema = z.object({
  classGroupId: z.number().int().positive("Selecione uma turma válida"),
  disciplineId: z.number().int().positive("Selecione uma disciplina válida"),
  instructorId: z.number().int().positive("Selecione um instrutor válido"),
  environmentId: z.number().int().positive("Selecione um ambiente válido"),
  shift: z.enum(['MANHA', 'TARDE', 'NOITE', 'INTEGRAL'], {
    errorMap: () => ({ message: "Turno deve ser MANHA, TARDE, NOITE ou INTEGRAL" }),
  }),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Data de início da disciplina inválida (use o formato YYYY-MM-DD)",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Data de término da disciplina inválida (use o formato YYYY-MM-DD)",
  }),
  sharepointUrl: z.string().url("Link do SharePoint inválido").optional().or(z.literal('')),
  status: z.enum(['PLANEJADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA']).default('PLANEJADA'),
  createdByUserId: z.number().int().positive("Usuário responsável obrigatório"),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: "A data de término deve ser igual ou posterior à data de início",
  path: ["endDate"],
});