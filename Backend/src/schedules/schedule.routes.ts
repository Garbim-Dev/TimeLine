import { Router, Request, Response } from 'express';
import multer from 'multer';
import { ScheduleImportService } from './schedule-import.service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint para importação em lote de planilha Excel
router.post('/import-excel', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    const body = req.body as { userId?: string | number } | undefined;
    const userId = body?.userId ? Number(body.userId) : 1;

    const result = await ScheduleImportService.importFromExcelBuffer(req.file.buffer, userId);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Falha ao processar planilha Excel.' });
  }
});

export const scheduleRouter = router;
export default router;