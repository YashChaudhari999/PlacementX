import { Router } from 'express';
import { 
  getReportsKPIs, 
  previewReport, 
  generateReport, 
  getExportHistory, 
  downloadReport,
  getReportTemplates
} from '../controllers/reports.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Reports currently aggregate institution-wide data.
router.use(authenticate, authorize('SUPER_ADMIN'));

router.get('/download/:id', downloadReport);
router.get('/kpis', getReportsKPIs);
router.get('/templates', getReportTemplates);
router.post('/preview', previewReport);
router.post('/generate', generateReport);
router.get('/history', getExportHistory);


export default router;
