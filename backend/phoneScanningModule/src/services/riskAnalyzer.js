const { 
  RISKY_PACKAGE_PATTERNS, 
  RISKY_PERMISSIONS, 
  TRUSTED_PACKAGES,
  RISK_LEVELS,
  RISK_THRESHOLDS,
} = require('../utils/constants');
const logger = require('../utils/logger');

class RiskAnalyzer {
  constructor() {
    this.analysisCount = 0;
    this.riskyAppCount = 0;
  }

  /**
   * Main risk analysis function
   */
  analyzeApp({ appName, packageName, permissions, isSystemApp, installTime }) {
    this.analysisCount++;
    
    let riskScore = 0;
    const reasons = [];
    const factors = {};

    // 1. Check if it's a trusted system app
    if (isSystemApp && this._isLegitimateSystemApp(packageName)) {
      return {
        riskLevel: RISK_LEVELS.SAFE,
        reasons: ['Verified system app'],
        riskScore: 0,
        factors: { systemApp: true },
      };
    }

    // 2. Check against trusted packages whitelist
    if (this._isTrustedPackage(packageName)) {
      return {
        riskLevel: RISK_LEVELS.SAFE,
        reasons: ['Verified trusted app'],
        riskScore: 0,
        factors: { trusted: true },
      };
    }

    // 3. Package name analysis
    const packageRisk = this._analyzePackageName(packageName);
    riskScore += packageRisk.score;
    factors.packageName = packageRisk.score;
    if (packageRisk.reason) {
      reasons.push(packageRisk.reason);
    }

    // 4. App name analysis
    const nameRisk = this._analyzeAppName(appName, packageName);
    riskScore += nameRisk.score;
    factors.appName = nameRisk.score;
    if (nameRisk.reason) {
      reasons.push(nameRisk.reason);
    }

    // 5. Permissions analysis
    const permissionRisk = this._analyzePermissions(permissions, packageName);
    riskScore += permissionRisk.score;
    factors.permissions = permissionRisk.score;
    reasons.push(...permissionRisk.reasons);

    // 6. Installation date check
    const installRisk = this._analyzeInstallDate(installTime);
    riskScore += installRisk.score;
    factors.installDate = installRisk.score;
    if (installRisk.reason) {
      reasons.push(installRisk.reason);
    }

    // 7. Determine risk level
    const riskLevel = this._calculateRiskLevel(riskScore);

    if (riskLevel !== RISK_LEVELS.SAFE) {
      this.riskyAppCount++;
    }

    return {
      riskLevel,
      riskScore,
      reasons: reasons.length > 0 ? reasons : ['No immediate risks detected'],
      factors,
    };
  }

  /**
   * Analyze package name for suspicious patterns
   */
  _analyzePackageName(packageName) {
    const lowerPackage = packageName.toLowerCase();

    // Check for risky patterns
    for (const pattern of RISKY_PACKAGE_PATTERNS) {
      if (lowerPackage.includes(pattern.keyword)) {
        return {
          score: pattern.score,
          reason: `⚠️ Suspicious package name contains "${pattern.keyword}"`,
        };
      }
    }

    // Check for unusual package structure
    const parts = packageName.split('.');
    if (parts.length < 2) {
      return {
        score: 30,
        reason: '⚠️ Unusual package structure (missing domain)',
      };
    }

    // Check for numeric-only TLD (suspicious)
    if (/^\d+$/.test(parts[0])) {
      return {
        score: 25,
        reason: '⚠️ Suspicious package domain',
      };
    }

    return { score: 0, reason: null };
  }

  /**
   * Analyze app name for suspicious patterns
   */
  _analyzeAppName(appName, packageName) {
    const lowerName = appName.toLowerCase();

    // Check for system app impersonation
    const systemKeywords = ['system', 'android', 'settings', 'google', 'samsung'];
    for (const keyword of systemKeywords) {
      if (lowerName === keyword || lowerName === `${keyword} app`) {
        // Check if package name matches (legitimate)
        if (!packageName.toLowerCase().includes(keyword)) {
          return {
            score: 60,
            reason: `🚨 App name "${appName}" mimics system app but package is "${packageName}"`,
          };
        }
      }
    }

    // Check for risky keywords in name
    const riskyNamePatterns = [
      { keyword: 'cleaner', score: 30 },
      { keyword: 'booster', score: 30 },
      { keyword: 'optimizer', score: 25 },
      { keyword: 'free coins', score: 50 },
      { keyword: 'free money', score: 50 },
      { keyword: 'lucky', score: 35 },
      { keyword: 'casino', score: 40 },
      { keyword: 'betting', score: 40 },
      { keyword: 'vpn free', score: 25 },
    ];

    for (const pattern of riskyNamePatterns) {
      if (lowerName.includes(pattern.keyword)) {
        return {
          score: pattern.score,
          reason: `⚠️ Suspicious app name contains "${pattern.keyword}"`,
        };
      }
    }

    return { score: 0, reason: null };
  }

  /**
   * Analyze app permissions
   */
  _analyzePermissions(permissions, packageName) {
    let score = 0;
    const reasons = [];
    const appType = this._guessAppType(packageName);

    for (const permission of permissions) {
      if (RISKY_PERMISSIONS[permission]) {
        const permScore = RISKY_PERMISSIONS[permission];
        score += permScore;

        // Explain why this permission is risky for this app
        const explanation = this._explainPermissionRisk(permission, appType);
        if (explanation) {
          reasons.push(explanation);
        }
      }
    }

    // Penalty for excessive permissions
    if (permissions.length > 15) {
      score += 20;
      reasons.push(`⚠️ Requests ${permissions.length} permissions (excessive)`);
    } else if (permissions.length > 20) {
      score += 30;
      reasons.push(`🚨 Requests ${permissions.length} permissions (very excessive)`);
    }

    return { score, reasons };
  }

  /**
   * Explain why a permission is risky for this app type
   */
  _explainPermissionRisk(permission, appType) {
    const explanations = {
      'android.permission.READ_SMS': {
        safe: ['messaging', 'banking', 'otp'],
        message: '📱 Can read your SMS messages',
      },
      'android.permission.SEND_SMS': {
        safe: ['messaging'],
        message: '📱 Can send SMS messages (may incur charges)',
      },
      'android.permission.READ_CONTACTS': {
        safe: ['messaging', 'social', 'communication'],
        message: '👥 Can access your contacts',
      },
      'android.permission.RECORD_AUDIO': {
        safe: ['communication', 'media', 'music'],
        message: '🎤 Can record audio',
      },
      'android.permission.CAMERA': {
        safe: ['camera', 'social', 'media', 'communication'],
        message: '📷 Can access camera',
      },
      'android.permission.ACCESS_FINE_LOCATION': {
        safe: ['maps', 'transportation', 'delivery', 'weather'],
        message: '📍 Tracks your precise location',
      },
      'android.permission.READ_CALL_LOG': {
        safe: ['communication', 'dialer'],
        message: '📞 Can read your call history',
      },
      'android.permission.REQUEST_INSTALL_PACKAGES': {
        safe: [],
        message: '🚨 Can install other apps (high risk)',
      },
      'android.permission.BIND_ACCESSIBILITY_SERVICE': {
        safe: [],
        message: '🚨 Has accessibility access (can see/control everything)',
      },
      'android.permission.SYSTEM_ALERT_WINDOW': {
        safe: ['utility', 'communication'],
        message: '⚠️ Can draw over other apps',
      },
    };

    const permInfo = explanations[permission];
    if (!permInfo) return null;

    // If app type matches safe categories, don't flag it
    if (permInfo.safe.includes(appType)) {
      return null;
    }

    return permInfo.message;
  }

  /**
   * Guess app type from package name
   */
  _guessAppType(packageName) {
    const lower = packageName.toLowerCase();

    const typePatterns = {
      messaging: ['messag', 'chat', 'whatsapp', 'telegram', 'signal'],
      banking: ['bank', 'pay', 'wallet', 'finance'],
      social: ['social', 'facebook', 'instagram', 'twitter', 'tiktok'],
      camera: ['camera', 'photo', 'snap'],
      maps: ['map', 'navigation', 'gps'],
      communication: ['call', 'dialer', 'phone', 'zoom', 'meet'],
      media: ['music', 'video', 'player', 'spotify', 'youtube'],
      game: ['game', 'play'],
      transportation: ['uber', 'taxi', 'ride', 'transport'],
      utility: ['util', 'tool', 'assistant'],
      otp: ['otp', 'authenticator', '2fa'],
    };

    for (const [type, patterns] of Object.entries(typePatterns)) {
      for (const pattern of patterns) {
        if (lower.includes(pattern)) {
          return type;
        }
      }
    }

    return 'unknown';
  }

  /**
   * Analyze installation date
   */
  _analyzeInstallDate(installTimeMillis) {
    if (!installTimeMillis || installTimeMillis === 0) {
      return { score: 0, reason: null };
    }

    const installDate = new Date(installTimeMillis);
    const now = new Date();
    const daysSinceInstall = Math.floor((now - installDate) / (1000 * 60 * 60 * 24));

    // Very recently installed (less than 1 day)
    if (daysSinceInstall < 1) {
      return {
        score: 10,
        reason: '🆕 Installed very recently (today)',
      };
    }

    return { score: 0, reason: null };
  }

  /**
   * Calculate risk level from score
   */
  _calculateRiskLevel(score) {
    if (score >= RISK_THRESHOLDS.CRITICAL) return RISK_LEVELS.CRITICAL;
    if (score >= RISK_THRESHOLDS.HIGH) return RISK_LEVELS.HIGH;
    if (score >= RISK_THRESHOLDS.MEDIUM) return RISK_LEVELS.MEDIUM;
    if (score >= RISK_THRESHOLDS.LOW) return RISK_LEVELS.LOW;
    return RISK_LEVELS.SAFE;
  }

  /**
   * Check if package is trusted
   */
  _isTrustedPackage(packageName) {
    // Exact match
    if (TRUSTED_PACKAGES.includes(packageName)) {
      return true;
    }

    // Prefix match (e.g., com.google.*)
    for (const trusted of TRUSTED_PACKAGES) {
      if (packageName.startsWith(trusted)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if system app is legitimate
   */
  _isLegitimateSystemApp(packageName) {
    const legitimatePrefixes = [
      'com.android.',
      'com.google.android.',
      'android.',
    ];

    return legitimatePrefixes.some(prefix => packageName.startsWith(prefix));
  }

  /**
   * Quick package name check
   */
  checkPackageName(packageName) {
    return this._analyzePackageName(packageName);
  }

  /**
   * Get analyzer statistics
   */
  getStats() {
    return {
      totalAnalyses: this.analysisCount,
      riskyAppsDetected: this.riskyAppCount,
      trustedPackagesCount: TRUSTED_PACKAGES.length,
      riskyPatternsCount: RISKY_PACKAGE_PATTERNS.length,
      riskyPermissionsCount: Object.keys(RISKY_PERMISSIONS).length,
      riskThresholds: RISK_THRESHOLDS,
    };
  }
}

module.exports = new RiskAnalyzer();
