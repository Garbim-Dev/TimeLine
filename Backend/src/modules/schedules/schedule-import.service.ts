import * as XLSX from 'xlsx';
import { PrismaClient, ShiftType, ScheduleStatus } from '@prisma/client';

const prisma = new PrismaClient();


export class ScheduleImportService {
  static async importFromExcelBuffer(buffer: Buffer, userId: number) {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    
    // Garantir que existe um ambiente padrão caso a planilha não forneça sala
    let defaultEnv = await prisma.environment.findFirst({
      where: { name: 'A Definir' }
    });
    if (!defaultEnv) {
      defaultEnv = await prisma.environment.create({
        data: {
          name: 'A Definir',
          capacity: 30,
          locationDetails: 'Ambiente a ser definido pela coordenação'
        }
      });
    }

    const sheetNames = workbook.SheetNames;
    let totalImported = 0;
    const errors: string[] = [];

    for (const sheetName of sheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

      let currentClassCode: string | null = null;
      let currentCourseCode: string | null = null;

      for (let i = 0; i < rawRows.length; i++) {
        const row = rawRows[i];

        // Lógica de Forward-Fill: se Turma / Cód.Interno vier na linha, atualiza; senão repete o anterior
        if (row['Turma']) {
          currentClassCode = String(row['Turma']).trim();
        }
        if (row['Cód.Interno']) {
          currentCourseCode = String(row['Cód.Interno']).trim();
        }

        const courseTitle = row['Curso'] ? String(row['Curso']).trim() : null;
        const disciplineName = row['Unidade Curricular'] ? String(row['Unidade Curricular']).trim() : null;
        const instructorName = row['Instrutor'] ? String(row['Instrutor']).trim() : null;
        const rawShift = row['Turno'] ? String(row['Turno']).trim().toLowerCase() : '';
        const ch = row['CH'] ? Number(row['CH']) : 40;
        const rawStart = row['Início'];
        const rawEnd = row['Término'];
        const companyStr = row['Empresa'] ? String(row['Empresa']).trim() : null;

        // Se faltar informação essencial mínima, pula a linha
        if (!courseTitle || !disciplineName || !rawStart || !rawEnd || !currentClassCode) {
          continue;
        }

        const startDate = new Date(rawStart);
        const endDate = new Date(rawEnd);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          errors.push(`Linha ${i + 2} (${sheetName}): Datas inválidas.`);
          continue;
        }

        // Mapear turno
        let shift: ShiftType = ShiftType.TARDE;
        if (rawShift.includes('manh') || rawShift.includes('manha')) shift = ShiftType.MANHA;
        else if (rawShift.includes('tard')) shift = ShiftType.TARDE;
        else if (rawShift.includes('noit')) shift = ShiftType.NOITE;
        else if (rawShift.includes('integ')) shift = ShiftType.INTEGRAL;

        try {
          // 1. Curso (obter ou criar)
          let course = await prisma.course.findFirst({
            where: { title: courseTitle }
          });
          if (!course) {
            course = await prisma.course.create({
              data: {
                title: courseTitle,
                courseCode: currentCourseCode || undefined,
                workloadHours: 0
              }
            });
          }

          // 2. Turma (obter ou criar)
          let classGroup = await prisma.classGroup.findUnique({
            where: { classCode: currentClassCode }
          });
          if (!classGroup) {
            classGroup = await prisma.classGroup.create({
              data: {
                classCode: currentClassCode,
                courseId: course.id,
                startDate: startDate,
                endDate: endDate
              }
            });
          }

          // 3. Empresas vinculadas à turma
          if (companyStr) {
            const companyNames = companyStr.split(',').map((c) => c.trim()).filter(Boolean);
            for (const cName of companyNames) {
              let comp = await prisma.company.findUnique({ where: { name: cName } });
              if (!comp) {
                comp = await prisma.company.create({ data: { name: cName } });
              }
              // Vincular na tabela associativa se não existir
              const assoc = await prisma.classGroupCompany.findUnique({
                where: {
                  classGroupId_companyId: {
                    classGroupId: classGroup.id,
                    companyId: comp.id
                  }
                }
              });
              if (!assoc) {
                await prisma.classGroupCompany.create({
                  data: {
                    classGroupId: classGroup.id,
                    companyId: comp.id
                  }
                });
              }
            }
          }

          // 4. Disciplina
          let discipline = await prisma.discipline.findFirst({
            where: {
              courseId: course.id,
              name: disciplineName
            }
          });
          if (!discipline) {
            discipline = await prisma.discipline.create({
              data: {
                courseId: course.id,
                name: disciplineName,
                workloadHours: ch || 40
              }
            });
          }

          // 5. Instrutor
          let instructor = null;
          if (instructorName) {
            instructor = await prisma.instructor.findFirst({
              where: { name: instructorName }
            });
            if (!instructor) {
              instructor = await prisma.instructor.create({
                data: {
                  name: instructorName,
                  areaExpertise: courseTitle
                }
              });
            }
          }

          if (!instructor) {
            // Instrutor padrão caso o campo esteja vazio
            instructor = await prisma.instructor.findFirst();
            if (!instructor) {
              instructor = await prisma.instructor.create({
                data: { name: 'Docente a Definir' }
              });
            }
          }

          // 6. Criar ou atualizar agendamento (evitando duplicar se já existir mesma turma, disciplina e data)
          const existingSchedule = await prisma.schedule.findFirst({
            where: {
              classGroupId: classGroup.id,
              disciplineId: discipline.id,
              startDate: startDate,
              endDate: endDate,
              deletedAt: null
            }
          });

          if (!existingSchedule) {
            await prisma.schedule.create({
              data: {
                classGroupId: classGroup.id,
                disciplineId: discipline.id,
                instructorId: instructor.id,
                environmentId: defaultEnv.id,
                shift: shift,
                startDate: startDate,
                endDate: endDate,
                status: ScheduleStatus.PLANEJADA,
                createdByUserId: userId
              }
            });
            totalImported++;
          }
        } catch (rowErr: any) {
          errors.push(`Erro no registro "${disciplineName}" (${currentClassCode}): ${rowErr.message}`);
        }
      }
    }

    return {
      success: true,
      totalImported,
      warnings: errors
    };
  }
}