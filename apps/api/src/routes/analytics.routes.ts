import { Router } from 'express';
import { 
  getPlacementOverview, 
  getPlacementDepartments, 
  getPlacementYearComparison, 
  getPlacementPackages, 
  getPlacementCompanies,
  getPlacementFunnel,
  getPlacementIntelligence
} from '../controllers/analytics.controller';

const router = Router();

router.get('/placement/overview', getPlacementOverview);
router.get('/placement/year-comparison', getPlacementYearComparison);
router.get('/placement/departments', getPlacementDepartments);
router.get('/placement/packages', getPlacementPackages);
router.get('/placement/companies', getPlacementCompanies);
router.get('/placement/funnel', getPlacementFunnel);
router.get('/placement/intelligence', getPlacementIntelligence);

// Fallback for older endpoints if still used somewhere
router.get('/overview', getPlacementOverview);
router.get('/departments', getPlacementDepartments);
router.get('/year-comparison', getPlacementYearComparison);
router.get('/salary', getPlacementPackages);
router.get('/insights', getPlacementIntelligence);

export default router;
