import { Router, Request, Response } from 'express';
import { prisma } from '../../config/database';

export const managementRouter = Router();

// ==================== INSTRUTORES ====================
managementRouter.get('/instructors', async (_req: Request, res: Response) => {
  try {
    const data = await prisma.instructor.findMany({ 
      where: { isActive: true }, 
      orderBy: { name: 'asc' } 
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

managementRouter.post('/instructors', async (req: Request, res: Response) => {
  try {
    const { name, registrationCode, email, phone, areaExpertise } = req.body;
    const instructor = await prisma.instructor.create({
      data: { name, registrationCode, email, phone, areaExpertise },
    });
    res.status(201).json(instructor);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

managementRouter.put('/instructors/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, registrationCode, email, phone, areaExpertise, isActive } = req.body;
    const updated = await prisma.instructor.update({
      where: { id: Number(id) },
      data: { name, registrationCode, email, phone, areaExpertise, isActive },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

managementRouter.delete('/instructors/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.instructor.delete({ where: { id: Number(id) } });
    res.json({ message: 'Instrutor removido com sucesso.' });
  } catch (err: any) {
    res.status(400).json({ error: 'Não é possível excluir o instrutor pois ele possui aulas agendadas.' });
  }
});

// ==================== TURMAS (Com suporte a Turmas Mistas) ====================
managementRouter.get('/classes', async (_req: Request, res: Response) => {
  try {
    const data = await prisma.classGroup.findMany({
      include: {
        course: true,
        companies: {
          include: { company: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = data.map((c) => {
      const partnerCompanies = (c.companies || [])
        .map((cc) => cc.company)
        .filter(Boolean);

      return {
        ...c,
        partnerCompanies,
        companiesSummary: partnerCompanies.length === 0 
          ? 'Demanda Regular' 
          : partnerCompanies.map((comp) => comp.name).join(' / '),
        isMixed: partnerCompanies.length > 1
      };
    });

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

managementRouter.post('/classes', async (req: Request, res: Response) => {
  try {
    const { classCode, courseId, companyIds, startDate, endDate } = req.body;
    
    const ids: number[] = Array.isArray(companyIds) 
      ? companyIds.map(Number) 
      : (companyIds ? [Number(companyIds)] : []);

    const newClass = await prisma.classGroup.create({
      data: {
        classCode,
        courseId: Number(courseId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        companies: {
          create: ids.map((cId) => ({ companyId: cId }))
        }
      },
      include: {
        course: true,
        companies: { include: { company: true } }
      },
    });

    res.status(201).json(newClass);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

managementRouter.put('/classes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { classCode, courseId, companyIds, startDate, endDate } = req.body;
    const classId = Number(id);

    const ids: number[] = Array.isArray(companyIds) 
      ? companyIds.map(Number) 
      : (companyIds ? [Number(companyIds)] : []);

    await prisma.$transaction([
      prisma.classGroupCompany.deleteMany({ where: { classGroupId: classId } }),
      prisma.classGroup.update({
        where: { id: classId },
        data: {
          classCode,
          courseId: Number(courseId),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          companies: {
            create: ids.map((cId) => ({ companyId: cId }))
          }
        },
      })
    ]);

    res.json({ message: 'Turma atualizada com sucesso.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

managementRouter.delete('/classes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.classGroup.delete({ where: { id: Number(id) } });
    res.json({ message: 'Turma removida com sucesso.' });
  } catch (err: any) {
    res.status(400).json({ error: 'Não é possível remover a turma pois existem disciplinas agendadas no cronograma.' });
  }
});

// ==================== CURSOS ====================
managementRouter.get('/courses', async (_req: Request, res: Response) => {
  try {
    const data = await prisma.course.findMany({
      include: { disciplines: true },
      orderBy: { title: 'asc' },
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

managementRouter.post('/courses', async (req: Request, res: Response) => {
  try {
    const { title, courseCode, workloadHours, description } = req.body;
    const course = await prisma.course.create({
      data: { title, courseCode, workloadHours: Number(workloadHours), description },
    });
    res.status(201).json(course);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

managementRouter.put('/courses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, courseCode, workloadHours, description, isActive } = req.body;
    const updated = await prisma.course.update({
      where: { id: Number(id) },
      data: { title, courseCode, workloadHours: Number(workloadHours), description, isActive },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

managementRouter.delete('/courses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({ where: { id: Number(id) } });
    res.json({ message: 'Curso removido com sucesso.' });
  } catch (err: any) {
    res.status(400).json({ error: 'Não é possível excluir o curso pois existem turmas vinculadas a ele.' });
  }
});

// ==================== DISCIPLINAS ====================
managementRouter.get('/disciplines', async (_req: Request, res: Response) => {
  try {
    const data = await prisma.discipline.findMany({
      include: { course: true },
      orderBy: { name: 'asc' },
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

managementRouter.post('/disciplines', async (req: Request, res: Response) => {
  try {
    const { courseId, name, code, workloadHours } = req.body;
    const discipline = await prisma.discipline.create({
      data: {
        courseId: Number(courseId),
        name,
        code: code || null,
        workloadHours: Number(workloadHours) || 40,
      },
      include: { course: true },
    });
    res.status(201).json(discipline);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

managementRouter.put('/disciplines/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { courseId, name, code, workloadHours } = req.body;
    const updated = await prisma.discipline.update({
      where: { id: Number(id) },
      data: {
        courseId: Number(courseId),
        name,
        code: code || null,
        workloadHours: Number(workloadHours) || 40,
      },
      include: { course: true },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

managementRouter.delete('/disciplines/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.discipline.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Disciplina excluída com sucesso.' });
  } catch (err: any) {
    res.status(400).json({ 
      error: 'Não é possível excluir a disciplina pois ela já possui alocações no cronograma.' 
    });
  }
});

// ==================== EMPRESAS PARCEIRAS ====================
managementRouter.get('/companies', async (_req: Request, res: Response) => {
  try {
    const data = await prisma.company.findMany({ orderBy: { name: 'asc' } });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

managementRouter.post('/companies', async (req: Request, res: Response) => {
  try {
    const company = await prisma.company.create({ data: req.body });
    res.status(201).json(company);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

managementRouter.put('/companies/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, cnpj, contactPerson, contactPhone } = req.body;
    const updated = await prisma.company.update({
      where: { id: Number(id) },
      data: { name, cnpj, contactPerson, contactPhone },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

managementRouter.delete('/companies/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.company.delete({ where: { id: Number(id) } });
    res.json({ message: 'Empresa parceira removida com sucesso.' });
  } catch (err: any) {
    res.status(400).json({ error: 'Não é possível excluir esta empresa pois há turmas associadas.' });
  }
});

// ==================== AMBIENTES ====================
managementRouter.get('/environments', async (_req: Request, res: Response) => {
  try {
    const data = await prisma.environment.findMany({ orderBy: { name: 'asc' } });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

managementRouter.post('/environments', async (req: Request, res: Response) => {
  try {
    const env = await prisma.environment.create({
      data: {
        name: req.body.name,
        capacity: Number(req.body.capacity) || 30,
        locationDetails: req.body.locationDetails,
      },
    });
    res.status(201).json(env);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

managementRouter.put('/environments/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, capacity, locationDetails, isActive } = req.body;
    const updated = await prisma.environment.update({
      where: { id: Number(id) },
      data: { name, capacity: Number(capacity), locationDetails, isActive },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

managementRouter.delete('/environments/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.environment.delete({ where: { id: Number(id) } });
    res.json({ message: 'Ambiente removido com sucesso.' });
  } catch (err: any) {
    res.status(400).json({ error: 'Não é possível remover o ambiente pois ele já está alocado em aulas.' });
  }
});

// ==================== DASHBOARD DE DISTRIBUIÇÃO DIÁRIA ====================
managementRouter.get('/dashboard/daily-distribution', async (req: Request, res: Response) => {
  try {
    const selectedDateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
    
    // Abrange o dia todo para evitar perdas por fuso horário UTC vs Local
    const startOfDay = new Date(`${selectedDateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${selectedDateStr}T23:59:59.999Z`);

    const environments = await prisma.environment.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    const schedules = await prisma.schedule.findMany({
      where: {
        deletedAt: null,
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay },
      },
      include: {
        classGroup: { 
          include: { 
            course: true, 
            companies: { 
              include: { company: true } 
            } 
          } 
        },
        discipline: true,
        instructor: true,
        environment: true,
      },
    });

    const allInstructors = await prisma.instructor.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    const environmentMap = environments.map((env) => {
      const envSchedules = schedules.filter((s) => s.environmentId === env.id);

      const getShiftData = (shiftName: 'MANHA' | 'TARDE' | 'NOITE') => {
        const item = envSchedules.find((s) => 
          s.shift.toUpperCase().replace('Ã', 'A') === shiftName.toUpperCase().replace('Ã', 'A')
        );
        if (!item) return null;

        // Extrai empresas parceiras de forma segura
        const companiesList = (item.classGroup?.companies || [])
          .map((c) => c.company?.name)
          .filter(Boolean) as string[];

        const companyLabel = companiesList.length === 0 
          ? null 
          : companiesList.length > 2 
            ? `Turma Mista (${companiesList.length} empresas)` 
            : companiesList.join(' / ');

        return {
          id: item.id,
          classCode: item.classGroup?.classCode || 'S/ Turma',
          course: item.classGroup?.course?.title || 'Curso',
          discipline: item.discipline?.name || 'Disciplina',
          instructor: item.instructor?.name || 'Docente',
          company: companyLabel,
          isMixed: companiesList.length > 1,
          status: item.status,
          sharepointUrl: item.sharepointUrl,
        };
      };

      return {
        id: env.id,
        name: env.name,
        location: env.locationDetails,
        shifts: {
          manha: getShiftData('MANHA'),
          tarde: getShiftData('TARDE'),
          noite: getShiftData('NOITE'),
        },
      };
    });

    const allocatedInstructorIds = new Set(schedules.map((s) => s.instructorId));
    const availableInstructors = allInstructors.filter((i) => !allocatedInstructorIds.has(i.id));

    // Turmas cuja empresa parceira atua em campo (Fase Empresa)
    const companyPhaseClasses = schedules
      .filter((s) => 
        (s.classGroup?.companies || []).some((cc) => 
          cc.company?.name?.toLowerCase().includes('vale')
        )
      )
      .map((s) => ({
        turma: s.classGroup.classCode,
        curso: s.classGroup.course?.title || '',
        empresa: (s.classGroup.companies || [])
          .map((cc) => cc.company?.name)
          .filter(Boolean)
          .join(' / '),
        turno: s.shift,
      }));

    res.json({
      date: selectedDateStr,
      environments: environmentMap,
      availableInstructors: availableInstructors.map((i) => i.name),
      companyPhaseClasses,
    });
  } catch (err: any) {
    console.error('Erro detalhado em /dashboard/daily-distribution:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== LISTA MASTER DE CRONOGRAMAS (ESTILO PLANILHA) ====================
managementRouter.get('/schedules-table', async (_req: Request, res: Response) => {
  try {
    const schedules = await prisma.schedule.findMany({
      where: { deletedAt: null },
      include: {
        classGroup: {
          include: {
            course: true,
            companies: { include: { company: true } },
          },
        },
        discipline: true,
        instructor: true,
        environment: true,
      },
      orderBy: [{ startDate: 'asc' }, { classGroupId: 'asc' }],
    });

    const formatted = schedules.map((s) => {
      const companies = (s.classGroup?.companies || [])
        .map((cc) => cc.company?.name)
        .filter(Boolean) as string[];

      const isCompanyPhase = 
        s.discipline.name.toLowerCase().includes('fase empresa') || 
        s.environment.name.toLowerCase().includes('empresa');

      return {
        id: s.id,
        taskCode: `APB.${s.classGroup.classCode.replace(/\D/g, '').slice(0, 6) || s.id}`,
        classCode: s.classGroup.classCode,
        course: s.classGroup.course.title,
        shift: s.shift,
        companies: companies,
        discipline: s.discipline.name,
        startDate: new Date(s.startDate).toLocaleDateString('pt-BR'),
        endDate: new Date(s.endDate).toLocaleDateString('pt-BR'),
        status: s.status === 'EM_ANDAMENTO' ? 'Em andamento' : s.status === 'CONCLUIDA' ? 'Concluído' : 'Não iniciado',
        instructor: isCompanyPhase ? 'Fase Empresa' : s.instructor.name,
        location: isCompanyPhase ? 'Empresa' : s.environment.name,
        isCompanyPhase,
      };
    });

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== CONSULTA ALUNO ====================
managementRouter.get('/student-schedule/:classCode', async (req: Request, res: Response) => {
  try {
    const { classCode } = req.params;
    const classGroup = await prisma.classGroup.findUnique({
      where: { classCode },
      include: { 
        course: true, 
        companies: { include: { company: true } } 
      },
    });

    if (!classGroup) {
      return res.status(404).json({ error: 'Turma não localizada.' });
    }

    const items = await prisma.schedule.findMany({
      where: { classGroupId: classGroup.id, deletedAt: null },
      include: {
        discipline: true,
        instructor: { select: { name: true, email: true } },
        environment: { select: { name: true, locationDetails: true } },
      },
      orderBy: { startDate: 'asc' },
    });

    const partnerNames = (classGroup.companies || [])
      .map((cc) => cc.company?.name)
      .filter(Boolean) as string[];

    res.json({
      turma: classGroup.classCode,
      curso: classGroup.course.title,
      empresa: partnerNames.length === 0 ? 'Demanda Regular' : partnerNames.join(' / '),
      cronograma: items.map((s) => ({
        id: s.id,
        disciplina: s.discipline.name,
        cargaHoraria: s.discipline.workloadHours,
        instrutor: s.instructor.name,
        ambiente: s.environment.name,
        localAmbiente: s.environment.locationDetails,
        turno: s.shift,
        inicio: s.startDate,
        termino: s.endDate,
        status: s.status,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});