import { Router } from 'express';
import { 
  getPlacementOverview, 
  getPlacementDepartments, 
  getPlacementYearComparison, 
  getPlacementPackages, 
  getPlacementCompanies,
  getPlacementFunnel,
  getPlacementIntelligence,
  mlForecast
} from '../controllers/analytics.controller';

import { exportReportExcel } from '../controllers/reports.controller';

import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Secure all analytics routes (Super Admin and Coordinator only)
router.use(protect, authorize('SUPER_ADMIN', 'COORDINATOR'));

router.get('/placement/overview', getPlacementOverview);
router.get('/placement/year-comparison', getPlacementYearComparison);
router.get('/placement/departments', getPlacementDepartments);
router.get('/placement/packages', getPlacementPackages);
router.get('/placement/companies', getPlacementCompanies);
router.get('/placement/funnel', getPlacementFunnel);
router.get('/placement/intelligence', getPlacementIntelligence);
router.get('/placement/forecast', mlForecast);
router.get('/export/excel', exportReportExcel);

// Fallback for older endpoints if still used somewhere
router.get('/overview', getPlacementOverview);
router.get('/departments', getPlacementDepartments);
router.get('/year-comparison', getPlacementYearComparison);
router.get('/salary', getPlacementPackages);
router.get('/insights', getPlacementIntelligence);

export default router;
