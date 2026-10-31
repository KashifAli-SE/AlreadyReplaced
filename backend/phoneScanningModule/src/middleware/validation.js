const { body, validationResult } = require('express-validator');

/**
 * Validation middleware for analyze-app endpoint
 */
exports.validateAppAnalysis = [
  body('appName')
    .notEmpty()
    .withMessage('App name is required')
    .isString()
    .withMessage('App name must be a string')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('App name must be between 1 and 100 characters'),

  body('packageName')
    .notEmpty()
    .withMessage('Package name is required')
    .isString()
    .withMessage('Package name must be a string')
    .matches(/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+[0-9a-z_]$/i)
    .withMessage('Invalid package name format'),

  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),

  body('permissions.*')
    .optional()
    .isString()
    .withMessage('Each permission must be a string'),

  body('isSystemApp')
    .optional()
    .isBoolean()
    .withMessage('isSystemApp must be a boolean'),

  body('installTimeMillis')
    .optional()
    .isInt({ min: 0 })
    .withMessage('installTimeMillis must be a positive integer'),

  body('version')
    .optional()
    .isString()
    .withMessage('Version must be a string'),

  body('useAI')
    .optional()
    .isBoolean()
    .withMessage('useAI must be a boolean'),

  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }
    next();
  },
];

/**
 * Validation middleware for batch analysis endpoint
 */
exports.validateBatchAnalysis = [
  body('apps')
    .notEmpty()
    .withMessage('Apps array is required')
    .isArray({ min: 1, max: 200 })
    .withMessage('Apps must be an array with 1-200 items'),

  body('apps.*.appName')
    .notEmpty()
    .withMessage('Each app must have an appName')
    .isString()
    .withMessage('App name must be a string'),

  body('apps.*.packageName')
    .notEmpty()
    .withMessage('Each app must have a packageName')
    .isString()
    .withMessage('Package name must be a string')
    .matches(/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+[0-9a-z_]$/i)
    .withMessage('Invalid package name format'),

  body('apps.*.permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),

  body('apps.*.isSystemApp')
    .optional()
    .isBoolean()
    .withMessage('isSystemApp must be a boolean'),

  body('options')
    .optional()
    .isObject()
    .withMessage('Options must be an object'),

  body('options.useAI')
    .optional()
    .isBoolean()
    .withMessage('useAI must be a boolean'),

  body('options.includeSystemApps')
    .optional()
    .isBoolean()
    .withMessage('includeSystemApps must be a boolean'),

  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }
    next();
  },
];
