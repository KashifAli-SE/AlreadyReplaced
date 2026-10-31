const riskAnalyzer = require('../services/riskAnalyzer');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');
const { RISK_LEVELS } = require('../utils/constants');

/**
 * Analyze a single app
 */
exports.analyzeApp = async (req, res) => {
  try {
    const {
      appName,
      packageName,
      permissions = [],
      isSystemApp = false,
      installTimeMillis = 0,
      version,
    } = req.body;

    logger.info(`Analyzing app: ${packageName}`);

    // 1. Rule-based analysis (fast, deterministic)
    const ruleBasedAnalysis = riskAnalyzer.analyzeApp({
      appName,
      packageName,
      permissions,
      isSystemApp,
      installTime: installTimeMillis,
    });

    // 2. AI-enhanced analysis (optional, for detailed insights)
    let aiInsights = null;
    const useAI = req.body.useAI && process.env.OPENAI_API_KEY;
    
    if (useAI && ruleBasedAnalysis.riskScore >= 40) {
      try {
        aiInsights = await aiService.analyzeAppWithAI({
          appName,
          packageName,
          permissions,
          riskReasons: ruleBasedAnalysis.reasons,
        });
        logger.info(`AI analysis completed for ${packageName}`);
      } catch (aiError) {
        logger.warn('AI analysis failed, using rule-based only', { 
          error: aiError.message,
          package: packageName,
        });
      }
    }

    // 3. Generate recommendations
    const recommendations = _generateRecommendations(ruleBasedAnalysis, permissions);

    // 4. Prepare response
    const result = {
      appName,
      packageName,
      version: version || 'Unknown',
      riskLevel: ruleBasedAnalysis.riskLevel,
      riskScore: ruleBasedAnalysis.riskScore,
      reasons: ruleBasedAnalysis.reasons,
      recommendations,
      aiInsights,
      analysis: {
        method: aiInsights ? 'rule-based + AI' : 'rule-based',
        timestamp: new Date().toISOString(),
        factors: ruleBasedAnalysis.factors,
      },
    };

    logger.info(`Analysis complete for ${packageName}`, {
      riskLevel: result.riskLevel,
      riskScore: result.riskScore,
    });

    res.json({ 
      success: true, 
      data: result 
    });

  } catch (error) {
    logger.error('Error in analyzeApp', { 
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze app',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined,
    });
  }
};

/**
 * Analyze multiple apps in batch
 */
exports.analyzeBatch = async (req, res) => {
  try {
    const { apps, options = {} } = req.body;
    const { useAI = false, includeSystemApps = false } = options;

    if (!apps || apps.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No apps provided for analysis',
      });
    }

    logger.info(`Starting batch analysis of ${apps.length} apps`, {
      useAI,
      includeSystemApps,
    });

    const startTime = Date.now();
    const results = [];
    const summary = {
      totalAnalyzed: 0,
      safe: 0,
      lowRisk: 0,
      mediumRisk: 0,
      highRisk: 0,
      criticalRisk: 0,
      skipped: 0,
    };

    for (const app of apps) {
      // Skip system apps if requested
      if (!includeSystemApps && app.isSystemApp) {
        summary.skipped++;
        continue;
      }

      try {
        // Rule-based analysis
        const analysis = riskAnalyzer.analyzeApp({
          appName: app.appName,
          packageName: app.packageName,
          permissions: app.permissions || [],
          isSystemApp: app.isSystemApp || false,
          installTime: app.installTimeMillis || 0,
        });

        // Optional AI enhancement for high-risk apps
        let aiInsights = null;
        if (useAI && analysis.riskScore >= 60 && process.env.OPENAI_API_KEY) {
          try {
            aiInsights = await aiService.analyzeAppWithAI({
              appName: app.appName,
              packageName: app.packageName,
              permissions: app.permissions || [],
              riskReasons: analysis.reasons,
            });
          } catch (aiError) {
            logger.warn(`AI analysis failed for ${app.packageName}`, {
              error: aiError.message,
            });
          }
        }

        const result = {
          appName: app.appName,
          packageName: app.packageName,
          riskLevel: analysis.riskLevel,
          riskScore: analysis.riskScore,
          reasons: analysis.reasons,
          recommendations: _generateRecommendations(analysis, app.permissions || []),
          aiInsights,
        };

        results.push(result);

        // Update summary
        summary.totalAnalyzed++;
        switch (analysis.riskLevel) {
          case RISK_LEVELS.SAFE:
            summary.safe++;
            break;
          case RISK_LEVELS.LOW:
            summary.lowRisk++;
            break;
          case RISK_LEVELS.MEDIUM:
            summary.mediumRisk++;
            break;
          case RISK_LEVELS.HIGH:
            summary.highRisk++;
            break;
          case RISK_LEVELS.CRITICAL:
            summary.criticalRisk++;
            break;
        }
      } catch (appError) {
        logger.error(`Error analyzing app ${app.packageName}`, {
          error: appError.message,
        });
        // Continue with other apps
      }
    }

    const duration = Date.now() - startTime;

    logger.info('Batch analysis complete', { 
      summary,
      duration: `${duration}ms`,
      avgPerApp: `${Math.round(duration / summary.totalAnalyzed)}ms`,
    });

    res.json({
      success: true,
      data: {
        results,
        summary,
        performance: {
          totalTimeMs: duration,
          averageTimePerAppMs: Math.round(duration / summary.totalAnalyzed),
        },
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    logger.error('Error in analyzeBatch', { 
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: 'Failed to analyze apps batch',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined,
    });
  }
};

/**
 * Get risk analysis statistics
 */
exports.getStats = async (req, res) => {
  try {
    const stats = riskAnalyzer.getStats();
    
    res.json({
      success: true,
      data: {
        ...stats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error in getStats', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics',
    });
  }
};

/**
 * Quick package name check
 */
exports.checkPackage = async (req, res) => {
  try {
    const { packageName } = req.body;

    if (!packageName) {
      return res.status(400).json({
        success: false,
        error: 'Package name is required',
      });
    }

    const isSuspicious = riskAnalyzer.checkPackageName(packageName);

    res.json({
      success: true,
      data: {
        packageName,
        isSuspicious: isSuspicious.isRisky,
        reason: isSuspicious.reason,
        score: isSuspicious.score,
      },
    });
  } catch (error) {
    logger.error('Error in checkPackage', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to check package name',
    });
  }
};

/**
 * Generate recommendations based on risk analysis
 * @private
 */
function _generateRecommendations(analysis, permissions = []) {
  const recommendations = [];

  if (analysis.riskLevel === RISK_LEVELS.SAFE) {
    return ['This app appears safe to use'];
  }

  // Critical/High risk recommendations
  if (analysis.riskLevel === RISK_LEVELS.CRITICAL || analysis.riskLevel === RISK_LEVELS.HIGH) {
    recommendations.push('🚨 Consider uninstalling this app immediately');
    recommendations.push('📋 Check your accounts for any unauthorized activity');
    recommendations.push('🔐 Change passwords for sensitive accounts');
  }

  // Permission-specific recommendations
  if (analysis.reasons.some(r => r.toLowerCase().includes('sms') || r.toLowerCase().includes('messages'))) {
    recommendations.push('📱 Revoke SMS permissions in Settings → Apps → Permissions');
  }

  if (analysis.reasons.some(r => r.toLowerCase().includes('contact'))) {
    recommendations.push('👥 Review and limit contact access');
  }

  if (analysis.reasons.some(r => r.toLowerCase().includes('location'))) {
    recommendations.push('📍 Consider disabling location access when not in use');
  }

  if (analysis.reasons.some(r => r.toLowerCase().includes('camera') || r.toLowerCase().includes('microphone'))) {
    recommendations.push('🎤 Only allow camera/microphone access when actively using the app');
  }

  // Medium/Low risk recommendations
  if (analysis.riskLevel === RISK_LEVELS.MEDIUM || analysis.riskLevel === RISK_LEVELS.LOW) {
    recommendations.push('⚙️ Review app permissions in Settings');
    recommendations.push('🔄 Keep the app updated to the latest version');
    recommendations.push('📖 Read user reviews for reported issues');
  }

  // Generic security advice
  if (permissions.length > 10) {
    recommendations.push('⚠️ This app requests many permissions - review each one carefully');
  }

  return recommendations;
}
