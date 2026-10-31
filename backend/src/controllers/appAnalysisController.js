const riskAnalyzer = require('../services/riskAnalyzer');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

/**
 * Analyze a single app
 */
exports.analyzeApp = async (req, res) => {
  try {
    const {
      appName,
      packageName,
      permissions,
      isSystemApp,
      installTimeMillis,
      version,
    } = req.body;

    // 1. Rule-based analysis (fast, deterministic)
    const ruleBasedAnalysis = riskAnalyzer.analyzeApp({
      appName,
      packageName,
      permissions: permissions || [],
      isSystemApp: isSystemApp || false,
      installTime: installTimeMillis || 0,
    });

    // 2. AI-enhanced analysis (optional, for detailed insights)
    let aiAnalysis = null;
    if (ruleBasedAnalysis.riskScore > 30) {
      try {
        aiAnalysis = await aiService.analyzeAppWithAI({
          appName,
          packageName,
          permissions: permissions || [],
          riskReasons: ruleBasedAnalysis.reasons,
        });
      } catch (aiError) {
        logger.warn('AI analysis failed, using rule-based only', { 
          error: aiError.message 
        });
      }
    }

    // 3. Combine results
    const result = {
      appName,
      packageName,
      riskLevel: ruleBasedAnalysis.riskLevel,
      riskScore: ruleBasedAnalysis.riskScore,
      reasons: ruleBasedAnalysis.reasons,
      recommendations: _generateRecommendations(ruleBasedAnalysis),
      aiInsights: aiAnalysis ? aiAnalysis.insights : null,
      analysis: {
        method: aiAnalysis ? 'rule-based + AI' : 'rule-based',
        timestamp: new Date().toISOString(),
      },
    };

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error in analyzeApp', { error: error.message });
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

    logger.info(`Starting batch analysis of ${apps.length} apps`);

    const results = [];
    const summary = {
      totalAnalyzed: 0,
      safe: 0,
      lowRisk: 0,
      mediumRisk: 0,
      highRisk: 0,
      criticalRisk: 0,
    };

    for (const app of apps) {
      // Skip system apps if requested
      if (!includeSystemApps && app.isSystemApp) {
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

        // Optional AI enhancement for risky apps
        let aiInsights = null;
        if (useAI && analysis.riskScore > 50) {
          try {
            const aiAnalysis = await aiService.analyzeAppWithAI({
              appName: app.appName,
              packageName: app.packageName,
              permissions: app.permissions || [],
              riskReasons: analysis.reasons,
            });
            aiInsights = aiAnalysis.insights;
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
          aiInsights,
        };

        results.push(result);

        // Update summary
        summary.totalAnalyzed++;
        switch (analysis.riskLevel) {
          case 'safe':
            summary.safe++;
            break;
          case 'low':
            summary.lowRisk++;
            break;
          case 'medium':
            summary.mediumRisk++;
            break;
          case 'high':
            summary.highRisk++;
            break;
          case 'critical':
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

    logger.info('Batch analysis complete', { summary });

    res.json({
      success: true,
      data: {
        results,
        summary,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error in analyzeBatch', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to analyze apps',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined,
    });
  }
};

/**
 * Generate recommendations based on risk analysis
 */
function _generateRecommendations(analysis) {
  const recommendations = [];

  if (analysis.riskLevel === 'safe') {
    return ['This app appears safe to use'];
  }

  if (analysis.riskLevel === 'critical' || analysis.riskLevel === 'high') {
    recommendations.push('Consider uninstalling this app immediately');
    recommendations.push('Check your accounts for any unauthorized activity');
  }

  if (analysis.reasons.some(r => r.includes('SMS') || r.includes('messages'))) {
    recommendations.push('Revoke SMS permissions if not needed');
  }

  if (analysis.reasons.some(r => r.includes('contacts'))) {
    recommendations.push('Review and limit contact access');
  }

  if (analysis.reasons.some(r => r.includes('location'))) {
    recommendations.push('Consider disabling location access when not in use');
  }

  if (analysis.reasons.some(r => r.includes('camera') || r.includes('microphone'))) {
    recommendations.push('Only allow camera/microphone access when actively using the app');
  }

  if (analysis.riskLevel === 'medium' || analysis.riskLevel === 'low') {
    recommendations.push('Review app permissions in Settings');
    recommendations.push('Keep the app updated to latest version');
  }

  return recommendations;
}
