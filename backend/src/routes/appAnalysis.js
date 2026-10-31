const express = require('express');
const router = express.Router();
const { analyzeApp, analyzeBatch } = require('../controllers/appAnalysisController');
const { validateAppAnalysis, validateBatchAnalysis } = require('../middleware/validation');

/**
 * POST /api/analyze/app
 * Analyze a single app for security risks
 */
router.post('/app', validateAppAnalysis, analyzeApp);

/**
 * POST /api/analyze/batch
 * Analyze multiple apps at once (for full phone scan)
 */
router.post('/batch', validateBatchAnalysis, analyzeBatch);

module.exports = router;
