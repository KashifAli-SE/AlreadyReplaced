# Scam Detection Agent - API Server

AI-powered scam detection for messages and phone calls using Google Gemini.

## Features

- ✅ **Text Message Analysis**: Detect phishing, fake offers, OTP requests
- ✅ **Live Call Detection**: Analyze ongoing phone calls in real-time
- ✅ **Incremental Analysis**: Process call transcripts chunk by chunk
- ✅ **Context-Aware**: Considers entire conversation history
- ✅ **REST API**: Easy integration with mobile apps

## Setup

### 1. Install Dependencies

```bash
cd agent
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your Google API key
```

### 3. Run the Server

```bash
python api_server.py
```

Server runs on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```

### Analyze Message
```
POST /api/scam/analyze-message

{
  "message": "Congratulations! You won Rs. 100,000..."
}
```

### Analyze Call (Real-time)
```
POST /api/scam/analyze-call

{
  "call_id": "call_123",
  "transcript_chunk": "Hello, this is your bank..."
}
```

### End Call Session
```
DELETE /api/scam/end-call/{call_id}
```

### Get Call Transcript
```
GET /api/scam/call-transcript/{call_id}
```

## Integration with Node.js Backend

Your Node.js backend can proxy requests to this Python service:

```javascript
// In Node.js backend
app.post('/api/scam/analyze', async (req, res) => {
  const response = await axios.post('http://localhost:5000/api/scam/analyze-message', {
    message: req.body.message
  });
  res.json(response.data);
});
```

## Testing

```bash
# Test message analysis
curl -X POST http://localhost:5000/api/scam/analyze-message \
  -H "Content-Type: application/json" \
  -d '{"message":"You won Rs. 100,000! Click here"}'

# Test call analysis
curl -X POST http://localhost:5000/api/scam/analyze-call \
  -H "Content-Type: application/json" \
  -d '{"call_id":"test_123","transcript_chunk":"Hello, this is from your bank"}'
```

## Security Notes

⚠️ **IMPORTANT**: Never commit API keys to Git!
- Use `.env` file for API keys
- The `.env` file is gitignored
- Rotate exposed keys immediately

## Deployment

### Option 1: Deploy with Node.js Backend
Run both services on same server:
- Node.js: Port 3000
- Python: Port 5000

### Option 2: Separate Deployment
Deploy Python service separately (Heroku, Railway, etc.)

## Architecture

```
Mobile App
    ↓
Node.js Backend (Port 3000)
    ↓
Python API (Port 5000)
    ↓
Google Gemini AI
```
