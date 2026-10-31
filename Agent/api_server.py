"""
Flask API wrapper for scam detection tools.
Allows mobile app to call Python services via HTTP.
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import tools
from Tools.scam_msgs_tool import scam_detection_tool
from Tools.scam_call_detection_tool import scam_call_detection_tool, reset_call_session, get_call_transcript

app = Flask(__name__)
CORS(app)  # Enable CORS for mobile app

# Health check
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'scam-detection-api',
        'version': '1.0.0'
    })

# Analyze a text message for scams
@app.route('/api/scam/analyze-message', methods=['POST'])
def analyze_message():
    """
    Analyze a message to detect scams.
    
    Request body:
    {
        "message": "Congratulations! You won..."
    }
    """
    try:
        data = request.json
        
        if not data or 'message' not in data:
            return jsonify({
                'success': False,
                'error': 'Message is required'
            }), 400
        
        message = data['message']
        
        if not message.strip():
            return jsonify({
                'success': False,
                'error': 'Message cannot be empty'
            }), 400
        
        # Analyze message
        result = scam_detection_tool.invoke({"message": message})
        
        return jsonify({
            'success': True,
            'data': {
                'message': message,
                'analysis': result
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Analyze call transcript chunk
@app.route('/api/scam/analyze-call', methods=['POST'])
def analyze_call():
    """
    Analyze a chunk of ongoing call transcript.
    
    Request body:
    {
        "call_id": "call_123",
        "transcript_chunk": "Hello, this is your bank..."
    }
    """
    try:
        data = request.json
        
        if not data or 'call_id' not in data or 'transcript_chunk' not in data:
            return jsonify({
                'success': False,
                'error': 'call_id and transcript_chunk are required'
            }), 400
        
        call_id = data['call_id']
        transcript_chunk = data['transcript_chunk']
        
        if not call_id.strip() or not transcript_chunk.strip():
            return jsonify({
                'success': False,
                'error': 'call_id and transcript_chunk cannot be empty'
            }), 400
        
        # Analyze call
        result = scam_call_detection_tool.invoke({
            "call_id": call_id,
            "transcript_chunk": transcript_chunk
        })
        
        return jsonify({
            'success': True,
            'data': {
                'call_id': call_id,
                'analysis': result
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# End a call session
@app.route('/api/scam/end-call/<call_id>', methods=['DELETE'])
def end_call(call_id):
    """
    End a call session and clear transcript.
    """
    try:
        success = reset_call_session(call_id)
        
        return jsonify({
            'success': True,
            'data': {
                'call_id': call_id,
                'deleted': success
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Get call transcript
@app.route('/api/scam/call-transcript/<call_id>', methods=['GET'])
def get_transcript(call_id):
    """
    Get the stored transcript for a call.
    """
    try:
        transcript = get_call_transcript(call_id)
        
        return jsonify({
            'success': True,
            'data': {
                'call_id': call_id,
                'transcript': transcript,
                'chunk_count': len(transcript)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('ENV', 'development') == 'development'
    
    print(f"🚀 Scam Detection API running on port {port}")
    print(f"📊 Environment: {os.getenv('ENV', 'development')}")
    print(f"🔗 Health check: http://localhost:{port}/health")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
