const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');
const { validateAppAnalysis, validateBatchAnalysis } = require('../middleware/validation');

/**
 * @route   POST /api/scan/analyze-app
 * @desc    Analyze a single app for security risks
 * @access  Public
 */
router.post('/analyze-app', validateAppAnalysis, scanController.analyzeApp);

/**
 * @route   POST /api/scan/batch
 * @desc    Analyze multiple apps at once (full phone scan)
 * @access  Public
 */
router.post('/batch', validateBatchAnalysis, scanController.analyzeBatch);

/**
 * @route   GET /api/scan/stats
 * @desc    Get statistics about risk database and patterns
 * @access  Public
 */
router.get('/stats', scanController.getStats);

/**
 * @route   POST /api/scan/check-package
 * @desc    Quick check if a package name looks suspicious
 * @access  Public
 */
router.post('/check-package', scanController.checkPackage);

module.exports = router;
