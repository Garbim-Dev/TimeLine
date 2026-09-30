import { prisma } from '../../config/database';
import { ShiftType, ScheduleStatus } from '@prisma/client';

export interface CreateScheduleDTO {
  classGroupId: number;
  disciplineId: number;
  instructorId: number;
  environmentId: number;
  shift: ShiftType;
  startDate: string;
  endDate: string;
  sharepointUrl?: string;
  status?: ScheduleStatus;
  createdByUserId: number;
}

export class ScheduleService {
  /**
   * Valida choques de agenda para o instrutor e para o ambiente
   */
  private static async checkConflicts(
    instructorId: number,
    environmentId: number,
    shift: ShiftType,
    start: Date,
    end: Date,
    excludeScheduleId?: number
  ) {
    // 1. Choque de Instrutor
    const instructorConflict = await prisma.schedule.findFirst({
      where: {
        id: excludeScheduleId ? { not: excludeScheduleId } : undefined,
        instructorId,
        shift,
        deletedAt: null,
        status: { not: 'CANCELADA' },
        AND: [
          { startDate: { lte: end } },
          { endDate: { gte: start } },
        ],
      },
      include: { classGroup: true, discipline: true },
    });

    if (instructorConflict) {
      throw new Error(
        `Conflito: O instrutor já está alocado na turma ${instructorConflict.classGroup.classCode} (${instructorConflict.discipline.name}) neste período e turno.`
      );
    }

    // 2. Choque de Ambiente
    const envConflict = await prisma.schedule.findFirst({
      where: {
        id: excludeScheduleId ? { not: excludeScheduleId } : undefined,
        environmentId,
        shift,
        deletedAt: null,
        status: { not: 'CANCELADA' },
        AND: [
          { startDate: { lte: end } },
          { endDate: { gte: start } },
        ],
      },
      include: { classGroup: true, discipline: true },
    });

    if (envConflict) {
      throw new Error(
        `Conflito: O ambiente já está ocupado pela turma ${envConflict.classGroup.classCode} (${envConflict.discipline.name}) neste período e turno.`
      );
    }
  }

  static async create(data: CreateScheduleDTO) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    await this.checkConflicts(data.instructorId, data.environmentId, data.shift, start, end);

    return prisma.schedule.create({
      data: {
        classGroupId: data.classGroupId,
        disciplineId: data.disciplineId,
        instructorId: data.instructorId,
        environmentId: data.environmentId,
        shift: data.shift,
        startDate: start,
        endDate: end,
        sharepointUrl: data.sharepointUrl || null,
        status: data.status || 'PLANEJADA',
        createdByUserId: data.createdByUserId,
      },
      include: {
        classGroup: { 
          include: { 
            course: true, 
            companies: { include: { company: true } } 
          } 
        },
        discipline: true,
        instructor: true,
        environment: true,
      },
    });
  }

  static async listAll() {
    return prisma.schedule.findMany({
      where: { deletedAt: null },
      include: {
        classGroup: { 
          include: { 
            course: true, 
            companies: { include: { company: true } } 
          } 
        },
        discipline: true,
        instructor: true,
        environment: true,
        createdByUser: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  static async listByInstructor(instructorId: number) {
    return prisma.schedule.findMany({
      where: { instructorId, deletedAt: null },
      include: {
        classGroup: { 
          include: { 
            course: true, 
            companies: { include: { company: true } } 
          } 
        },
        discipline: true,
        environment: true,
        createdByUser: { select: { id: true, name: true } },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  /**
   * Consulta pelo código da turma (ex: APB.040.352) para a visão do aluno
   */
  static async listByClassCode(classCode: string) {
    const classGroup = await prisma.classGroup.findUnique({
      where: { classCode },
      include: {
        course: true,
        companies: { include: { company: true } },
      },
    });

    if (!classGroup) return null;

    const schedules = await prisma.schedule.findMany({
      where: { 
        classGroupId: classGroup.id, 
        deletedAt: null 
      },
      include: {
        discipline: true,
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            areaExpertise: true,
          }
        },
        environment: true,
      },
      orderBy: { startDate: 'asc' },
    });

    return {
      classGroup,
      schedules,
    };
  }

  /**
   * Consulta por ID da turma já vinculada ao perfil do aluno
   */
  static async listByClassGroupId(classGroupId: number) {
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classGroupId },
      include: {
        course: true,
        companies: { include: { company: true } },
      },
    });

    if (!classGroup) return null;

    const schedules = await prisma.schedule.findMany({
      where: { 
        classGroupId, 
        deletedAt: null 
      },
      include: {
        discipline: true,
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            areaExpertise: true,
          }
        },
        environment: true,
      },
      orderBy: { startDate: 'asc' },
    });

    return {
      classGroup,
      schedules,
    };
  }
}