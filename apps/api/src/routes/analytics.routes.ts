import { Router } from 'express';
import { getAnalyticsSummary, getAnalyticsCharts, getAnalyticsAiInsights } from '../controllers/analytics.controller';

const router = Router();

router.get('/summary', getAnalyticsSummary);
router.get('/charts', getAnalyticsCharts);
router.get('/ai-insights', getAnalyticsAiInsights);

export default router;
