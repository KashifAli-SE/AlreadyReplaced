# Phone Scanning Module - Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
cd backend/phoneScanningModule
npm install
```

### 2. Configure Environment
```bash
# Copy example env file
copy .env.example .env

# Edit .env (optional AI key for enhanced analysis)
notepad .env
```

### 3. Start the Server
```bash
npm start
```

Server will run on `http://localhost:3000`

## Testing the API

### Option 1: Use the test.http file
If you have REST Client extension in VS Code:
1. Open `test.http`
2. Click "Send Request" above any request

### Option 2: Use curl
```bash
# Health check
curl http://localhost:3000/health

# Analyze a single app
curl -X POST http://localhost:3000/api/scan/analyze-app \
  -H "Content-Type: application/json" \
  -d "{\"appName\":\"Super Cleaner\",\"packageName\":\"com.fake.cleaner\",\"permissions\":[\"android.permission.READ_SMS\"]}"
```

### Option 3: Use Postman
Import the test requests from `test.http` or use the examples in README.md

## Integration with Flutter App

Your teammate building the Flutter app should call these endpoints:

```dart
// Example: Batch scan all apps
Future<Map<String, dynamic>> scanAllApps(List<AppInfo> apps) async {
  final response = await http.post(
    Uri.parse('http://localhost:3000/api/scan/batch'),
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
  
  return json.decode(response.body);
}
```

## What Each Endpoint Does

### 1. `/api/scan/analyze-app` - Single App Analysis
**When to use:** Checking one specific app
**Response time:** ~10-50ms

### 2. `/api/scan/batch` - Full Phone Scan
**When to use:** Scanning all apps on the phone
**Response time:** ~1-3 seconds for 100 apps

### 3. `/api/scan/check-package` - Quick Package Check
**When to use:** Real-time validation while user types
**Response time:** <10ms

### 4. `/api/scan/stats` - Get Statistics
**When to use:** Showing database info, debug
**Response time:** <5ms

## Risk Detection Examples

### ✅ Safe App (WhatsApp)
```json
{
  "riskLevel": "safe",
  "riskScore": 0,
  "reasons": ["Verified trusted app"]
}
```

### ⚠️ Medium Risk (Phone Cleaner)
```json
{
  "riskLevel": "medium",
  "riskScore": 55,
  "reasons": [
    "Suspicious package name contains 'cleaner'",
    "Can read your SMS messages"
  ]
}
```

### 🚨 Critical Risk (Malware)
```json
{
  "riskLevel": "critical",
  "riskScore": 130,
  "reasons": [
    "App name 'System' mimics system app",
    "Can install other apps (high risk)",
    "Has accessibility access"
  ]
}
```

## Deployment

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Heroku
```bash
# Create Heroku app
heroku create your-app-name

# Push to Heroku
git push heroku main

# Set environment variables
heroku config:set NODE_ENV=production
```

### Deploy to Railway
1. Push to GitHub
2. Connect repository on railway.app
3. Add environment variables
4. Deploy automatically

## Troubleshooting

### Port already in use
```bash
# Change PORT in .env
PORT=3001
```

### Module not found
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### AI analysis not working
```bash
# Check your API key in .env
# Make sure OPENAI_API_KEY or ANTHROPIC_API_KEY is set
# Set useAI: true in your request
```

## Project Structure
```
phoneScanningModule/
├── src/
│   ├── index.js              # Server entry point
│   ├── routes/
│   │   └── scanRoutes.js     # API routes
│   ├── controllers/
│   │   └── scanController.js # Request handlers
│   ├── services/
│   │   ├── riskAnalyzer.js   # Core risk logic ⭐
│   │   └── aiService.js      # AI integration
│   ├── middleware/
│   │   └── validation.js     # Input validation
│   └── utils/
│       ├── constants.js      # Risk patterns
│       └── logger.js         # Logging
├── test.http                 # API tests
├── package.json
├── .env.example
└── README.md
```

## Need Help?

Check the logs in `logs/combined.log` and `logs/error.log`

For common issues, see README.md
