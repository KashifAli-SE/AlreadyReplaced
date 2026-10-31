# Phone Scanning Module - Backend API

Backend service for analyzing phone apps for security risks, detecting malicious behavior, and providing risk assessments.

## Features

- ✅ **App Risk Analysis**: Analyze individual apps based on permissions, package name, and behavior patterns
- ✅ **Batch Scanning**: Scan multiple apps at once (full phone scan)
- ✅ **AI-Enhanced Detection**: Optional AI analysis for detailed insights
- ✅ **Permission Analysis**: Detect excessive or suspicious permissions
- ✅ **Malicious Pattern Detection**: Identify apps mimicking system apps or using risky patterns
- ✅ **Real-time Risk Scoring**: Calculate risk scores based on multiple factors

## API Endpoints

### 1. Analyze Single App
```
POST /api/scan/analyze-app
```

**Request Body:**
```json
{
  "appName": "Super Cleaner",
  "packageName": "com.example.cleaner",
  "permissions": [
    "android.permission.READ_SMS",
    "android.permission.READ_CONTACTS"
  ],
  "isSystemApp": false,
  "installTimeMillis": 1698764400000,
  "version": "1.0.0"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "appName": "Super Cleaner",
    "packageName": "com.example.cleaner",
    "riskLevel": "high",
    "riskScore": 85,
    "reasons": [
      "Suspicious app name: cleaner",
      "Can read your SMS messages",
      "Can access your contacts"
    ],
    "recommendations": [
      "Consider uninstalling this app immediately",
      "Revoke SMS permissions if not needed"
    ],
    "aiInsights": "This app requests excessive permissions..."
  }
}
```

### 2. Batch Scan (Full Phone Scan)
```
POST /api/scan/batch
```

**Request Body:**
```json
{
  "apps": [
    {
      "appName": "WhatsApp",
      "packageName": "com.whatsapp",
      "permissions": ["android.permission.CAMERA"],
      "isSystemApp": false
    },
    {
      "appName": "Lucky Casino",
      "packageName": "com.lucky.casino",
      "permissions": ["android.permission.READ_SMS"],
      "isSystemApp": false
    }
  ],
  "options": {
    "useAI": false,
    "includeSystemApps": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [...],
    "summary": {
      "totalAnalyzed": 45,
      "safe": 38,
      "lowRisk": 3,
      "mediumRisk": 2,
      "highRisk": 2,
      "criticalRisk": 0
    },
    "timestamp": "2026-10-31T12:00:00.000Z"
  }
}
```

### 3. Get Risk Database Stats
```
GET /api/scan/stats
```

## Installation

```bash
cd phoneScanningModule
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

## Environment Variables

```env
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=your_key_here  # Optional for AI analysis
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Risk Analysis Algorithm

The module uses a multi-factor risk scoring system:

1. **Package Name Analysis** (0-40 points)
   - Checks for suspicious keywords (casino, hack, cleaner)
   - Validates package structure

2. **App Name Analysis** (0-50 points)
   - Detects system app impersonation
   - Identifies risky keywords

3. **Permission Analysis** (0-100+ points)
   - Scores each permission based on sensitivity
   - Detects permission-app type mismatches

4. **Install Date Check** (0-10 points)
   - Flags recently installed apps

5. **Trusted App Whitelist**
   - Known legitimate apps (WhatsApp, Google, etc.) are marked safe

### Risk Levels

| Score | Level | Action |
|-------|-------|--------|
| 0-19 | Safe | No action needed |
| 20-39 | Low Risk | Monitor |
| 40-59 | Medium Risk | Review permissions |
| 60-79 | High Risk | Consider uninstalling |
| 80+ | Critical | Uninstall immediately |

## Integration with Flutter App

```dart
// Example Flutter integration
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<Map<String, dynamic>> scanPhone(List<AppInfo> apps) async {
  final response = await http.post(
    Uri.parse('https://your-api.com/api/scan/batch'),
    headers: {'Content-Type': 'application/json'},
    body: json.encode({
      'apps': apps.map((app) => {
        'appName': app.name,
        'packageName': app.package,
        'permissions': app.permissions,
        'isSystemApp': app.isSystem,
      }).toList(),
      'options': {
        'useAI': false,
        'includeSystemApps': false,
      }
    }),
  );
  
  return json.decode(response.body);
}
```

## Architecture

```
phoneScanningModule/
├── src/
│   ├── index.js                 # Main entry point
│   ├── routes/
│   │   └── scanRoutes.js        # API routes
│   ├── controllers/
│   │   └── scanController.js    # Request handlers
│   ├── services/
│   │   ├── riskAnalyzer.js      # Core risk analysis logic
│   │   └── aiService.js         # AI integration (optional)
│   ├── middleware/
│   │   └── validation.js        # Request validation
│   ├── utils/
│   │   ├── logger.js            # Logging utility
│   │   └── constants.js         # Risk patterns & thresholds
│   └── config/
│       └── database.js          # Database configuration (optional)
```

## Security Features

- ✅ Rate limiting to prevent abuse
- ✅ Input validation and sanitization
- ✅ Helmet.js for HTTP security headers
- ✅ CORS configuration
- ✅ No user data stored on server
- ✅ Request logging for monitoring

## Performance

- **Single app analysis**: ~10-50ms
- **Batch scan (100 apps)**: ~1-3 seconds
- **With AI enhancement**: +2-5 seconds per high-risk app

## Future Enhancements

- [ ] Machine learning model for better detection
- [ ] Real-time threat intelligence integration
- [ ] Scan history database
- [ ] User feedback loop for false positives
- [ ] Support for iOS app analysis

## License

MIT
