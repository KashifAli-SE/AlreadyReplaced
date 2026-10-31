# Phone Scanning Module - API Documentation

## Base URL
```
http://localhost:3000/api/scan
```

Production: Replace with your deployed URL (e.g., `https://your-app.vercel.app/api/scan`)

---

## Authentication
Currently **no authentication required**. Add API key authentication if needed in production.

---

## Endpoints

### 1. Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "phone-scanning-module",
  "timestamp": "2026-10-31T12:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

---

### 2. Analyze Single App

```
POST /api/scan/analyze-app
```

**Request Body:**
```json
{
  "appName": "Super Cleaner Pro",           // Required: string
  "packageName": "com.fake.cleaner",        // Required: string (Android package format)
  "permissions": [                          // Optional: array of strings
    "android.permission.READ_SMS",
    "android.permission.CAMERA"
  ],
  "isSystemApp": false,                     // Optional: boolean (default: false)
  "installTimeMillis": 1698764400000,      // Optional: integer (Unix timestamp)
  "version": "1.0.0",                       // Optional: string
  "useAI": false                            // Optional: boolean (requires API key)
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "data": {
    "appName": "Super Cleaner Pro",
    "packageName": "com.fake.cleaner",
    "version": "1.0.0",
    "riskLevel": "high",                    // safe | low | medium | high | critical
    "riskScore": 85,                        // 0-150+
    "reasons": [
      "⚠️ Suspicious package name contains 'cleaner'",
      "📱 Can read your SMS messages"
    ],
    "recommendations": [
      "🚨 Consider uninstalling this app immediately",
      "📱 Revoke SMS permissions in Settings → Apps → Permissions"
    ],
    "aiInsights": null,                     // string or null (only if useAI: true)
    "analysis": {
      "method": "rule-based",
      "timestamp": "2026-10-31T12:00:00.000Z",
      "factors": {
        "packageName": 35,
        "appName": 30,
        "permissions": 20,
        "installDate": 0
      }
    }
  }
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "msg": "Package name is required",
      "param": "packageName",
      "location": "body"
    }
  ]
}
```

**Response (Error - 500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Failed to analyze app"
}
```

---

### 3. Batch Analysis (Full Phone Scan)

```
POST /api/scan/batch
```

**Request Body:**
```json
{
  "apps": [                                 // Required: array (1-200 items)
    {
      "appName": "WhatsApp",
      "packageName": "com.whatsapp",
      "permissions": ["android.permission.CAMERA"],
      "isSystemApp": false,
      "installTimeMillis": 1698000000000
    },
    {
      "appName": "Lucky Casino",
      "packageName": "com.lucky.casino",
      "permissions": [
        "android.permission.READ_SMS",
        "android.permission.ACCESS_FINE_LOCATION"
      ],
      "isSystemApp": false
    }
  ],
  "options": {                              // Optional: object
    "useAI": false,                         // boolean (default: false)
    "includeSystemApps": false              // boolean (default: false)
  }
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "appName": "WhatsApp",
        "packageName": "com.whatsapp",
        "riskLevel": "safe",
        "riskScore": 0,
        "reasons": ["Verified trusted app"],
        "recommendations": ["This app appears safe to use"],
        "aiInsights": null
      },
      {
        "appName": "Lucky Casino",
        "packageName": "com.lucky.casino",
        "riskLevel": "high",
        "riskScore": 75,
        "reasons": [
          "⚠️ Suspicious package name contains 'casino'",
          "📱 Can read your SMS messages"
        ],
        "recommendations": [
          "🚨 Consider uninstalling this app immediately"
        ],
        "aiInsights": null
      }
    ],
    "summary": {
      "totalAnalyzed": 2,
      "safe": 1,
      "lowRisk": 0,
      "mediumRisk": 0,
      "highRisk": 1,
      "criticalRisk": 0,
      "skipped": 0
    },
    "performance": {
      "totalTimeMs": 156,
      "averageTimePerAppMs": 78
    },
    "timestamp": "2026-10-31T12:00:00.000Z"
  }
}
```

---

### 4. Check Package Name Only

```
POST /api/scan/check-package
```

**Request Body:**
```json
{
  "packageName": "com.lucky.casino"         // Required: string
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "data": {
    "packageName": "com.lucky.casino",
    "isSuspicious": true,
    "reason": "⚠️ Suspicious package name contains 'casino'",
    "score": 40
  }
}
```

---

### 5. Get Statistics

```
GET /api/scan/stats
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "data": {
    "totalAnalyses": 1250,
    "riskyAppsDetected": 45,
    "trustedPackagesCount": 52,
    "riskyPatternsCount": 18,
    "riskyPermissionsCount": 38,
    "riskThresholds": {
      "LOW": 20,
      "MEDIUM": 40,
      "HIGH": 60,
      "CRITICAL": 80
    },
    "timestamp": "2026-10-31T12:00:00.000Z"
  }
}
```

---

## Risk Levels

| Level | Score Range | Description | Action |
|-------|-------------|-------------|--------|
| `safe` | 0-19 | No immediate risks detected | No action needed |
| `low` | 20-39 | Minor concerns | Monitor, review permissions |
| `medium` | 40-59 | Moderate risk | Review permissions, consider alternatives |
| `high` | 60-79 | Significant risk | Consider uninstalling |
| `critical` | 80+ | Severe risk | Uninstall immediately |

---

## Flutter Integration Example

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class PhoneScannerAPI {
  static const String baseUrl = 'http://localhost:3000/api/scan';
  
  /// Analyze a single app
  static Future<AppAnalysisResult> analyzeApp(AppInfo app) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/analyze-app'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'appName': app.name,
          'packageName': app.packageName,
          'permissions': app.permissions,
          'isSystemApp': app.isSystemApp,
          'installTimeMillis': app.installTime,
        }),
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return AppAnalysisResult.fromJson(data['data']);
      } else {
        throw Exception('Analysis failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
  
  /// Batch scan multiple apps
  static Future<BatchScanResult> scanBatch(List<AppInfo> apps) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/batch'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'apps': apps.map((app) => {
            'appName': app.name,
            'packageName': app.packageName,
            'permissions': app.permissions,
            'isSystemApp': app.isSystemApp,
            'installTimeMillis': app.installTime,
          }).toList(),
          'options': {
            'useAI': false,
            'includeSystemApps': false,
          }
        }),
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return BatchScanResult.fromJson(data['data']);
      } else {
        throw Exception('Batch scan failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
  
  /// Quick package name check
  static Future<bool> isPackageSuspicious(String packageName) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/check-package'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'packageName': packageName}),
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['data']['isSuspicious'] as bool;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}

// Models
class AppAnalysisResult {
  final String appName;
  final String packageName;
  final String riskLevel;
  final int riskScore;
  final List<String> reasons;
  final List<String> recommendations;
  
  AppAnalysisResult.fromJson(Map<String, dynamic> json)
      : appName = json['appName'],
        packageName = json['packageName'],
        riskLevel = json['riskLevel'],
        riskScore = json['riskScore'],
        reasons = List<String>.from(json['reasons']),
        recommendations = List<String>.from(json['recommendations']);
}

class BatchScanResult {
  final List<AppAnalysisResult> results;
  final ScanSummary summary;
  
  BatchScanResult.fromJson(Map<String, dynamic> json)
      : results = (json['results'] as List)
            .map((item) => AppAnalysisResult.fromJson(item))
            .toList(),
        summary = ScanSummary.fromJson(json['summary']);
}

class ScanSummary {
  final int totalAnalyzed;
  final int safe;
  final int lowRisk;
  final int mediumRisk;
  final int highRisk;
  final int criticalRisk;
  
  ScanSummary.fromJson(Map<String, dynamic> json)
      : totalAnalyzed = json['totalAnalyzed'],
        safe = json['safe'],
        lowRisk = json['lowRisk'],
        mediumRisk = json['mediumRisk'],
        highRisk = json['highRisk'],
        criticalRisk = json['criticalRisk'];
}
```

---

## Rate Limiting

**Default limits:**
- 100 requests per 15 minutes per IP
- Exceeded: HTTP 429 response

**Response when rate limited:**
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

---

## Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success | Request processed successfully |
| 400 | Bad Request | Invalid input, validation failed |
| 404 | Not Found | Invalid endpoint |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error, check logs |

---

## Performance Notes

- **Single app analysis**: 10-50ms
- **Batch scan (100 apps)**: 1-3 seconds
- **With AI enhancement**: +2-5 seconds per high-risk app
- **Network latency**: Add 50-200ms for API calls

**Recommendation:** For best UX, show a progress indicator during batch scans.

---

## Best Practices

1. **Batch scanning**: Always use `/batch` endpoint for full phone scans
2. **Error handling**: Implement retry logic for network errors
3. **Caching**: Cache results locally, refresh every 24 hours
4. **Loading states**: Show progress during scans
5. **Offline fallback**: Store last scan results locally

---

## Testing

Use the provided `test.http` file or import into Postman:

```bash
# Test health
curl http://localhost:3000/health

# Test single app
curl -X POST http://localhost:3000/api/scan/analyze-app \
  -H "Content-Type: application/json" \
  -d '{"appName":"Test","packageName":"com.test.app","permissions":[]}'
```

---

## Support

For issues or questions:
1. Check `logs/error.log` for server errors
2. Verify request format matches examples above
3. Test with provided examples in `test.http`
