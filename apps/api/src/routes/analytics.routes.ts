import { Router } from 'express';
import { 
  getPlacementOverview,
  getPlacementHealthScore,
  getPlacementDepartments, 
  getPlacementYearComparison, 
  getPlacementPackages, 
  getPlacementCompanies,
  getPlacementFunnel,
  getPlacementIntelligence,
  getPlacementStudents,
  getPlacementSkills,
  getPlacementDrives,
  getActionCenter,
  getPlacementOperational,
  mlForecast,
  getFilterOptions,
} from '../controllers/analytics.controller';

import { exportReportExcel } from '../controllers/reports.controller';

import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Secure all analytics routes (Super Admin and Coordinator only)
router.use(protect, authorize('SUPER_ADMIN', 'COORDINATOR'));

// ── Core Analytics ────────────────────────────────────────
router.get('/placement/overview', getPlacementOverview);
router.get('/placement/health-score', getPlacementHealthScore);
router.get('/placement/year-comparison', getPlacementYearComparison);
router.get('/placement/departments', getPlacementDepartments);
router.get('/placement/packages', getPlacementPackages);
router.get('/placement/companies', getPlacementCompanies);
router.get('/placement/funnel', getPlacementFunnel);
router.get('/placement/forecast', mlForecast);

// ── Advanced Analytics ────────────────────────────────────
router.get('/placement/students', getPlacementStudents);
router.get('/placement/skills', getPlacementSkills);
router.get('/placement/drives', getPlacementDrives);

// ── Intelligence & Actions ────────────────────────────────
router.get('/placement/intelligence', getPlacementIntelligence);
router.get('/placement/action-center', getActionCenter);
router.get('/placement/operational', getPlacementOperational);

// ── Utilities ─────────────────────────────────────────────
router.get('/placement/filter-options', getFilterOptions);
router.get('/export/excel', exportReportExcel);

// ── Legacy fallbacks ──────────────────────────────────────
router.get('/overview', getPlacementOverview);
router.get('/departments', getPlacementDepartments);
router.get('/year-comparison', getPlacementYearComparison);
router.get('/salary', getPlacementPackages);
router.get('/insights', getPlacementIntelligence);

export default router;
