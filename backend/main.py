import base64
import requests
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import dotenv
import os

from Agent.Tools.utility_bill_verification_tool import analyze_utility_bill

# Load environment variables from .env file
dotenv.load_dotenv()

app = FastAPI()

# Replace with your actual VirusTotal API key or load it from an .env file
VT_API_KEY = os.getenv("VT_API_KEY")
VT_URL = "https://www.virustotal.com/api/v3/urls/"

class URLCheckRequest(BaseModel):
    url: str

def get_url_identifier(url: str) -> str:
    """Encodes a URL into VirusTotal's required base64 format (without padding)."""
    url_bytes = url.encode("utf-8")
    base64_encoded = base64.urlsafe_b64encode(url_bytes).decode("utf-8")
    return base64_encoded.strip("=")

@app.post("/api/check-qr-url")
def check_qr_url(data: URLCheckRequest):
    target_url = data.url
    url_id = get_url_identifier(target_url)
    
    headers = {
        "Accept": "application/json",
        "X-Apikey": VT_API_KEY
    }
    
    try:
        response = requests.get(VT_URL + url_id, headers=headers)
        
        # PRINT THIS TO YOUR TERMINAL TO SEE THE REAL ERROR
        print(f"VT Status Code: {response.status_code}")
        print(f"VT Response: {response.text}")
        # print(f"VT URL ID: {url_id}")
        # print(f'VTAPI_KEY: {VT_API_KEY}')
        
        if response.status_code == 404:
            return {
                "url": target_url,
                "status": "unknown",
                "message": "This link is brand new or hasn't been indexed. Proceed with caution."
            }
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"VT API Error: {response.text}")
            
        result = response.json()
        stats = result.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
        malicious_count = stats.get("malicious", 0)
        suspicious_count = stats.get("suspicious", 0)
        
        if malicious_count > 0:
            return {"url": target_url, "status": "danger", "message": f"🚨 Flagged as malicious by {malicious_count} vendors."}
        elif suspicious_count > 0:
            return {"url": target_url, "status": "suspicious", "message": "⚠️ Warning: Suspicious pattern detected."}
        else:
            return {"url": target_url, "status": "safe", "message": "🟢 Safe: No vendors flagged this URL."}
            
    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



#verify utility bill endpoint
@app.post("/verify-utility-bill")
async def verify_utility_bill(
    file: UploadFile = File(...)
):
    pdf_bytes = await file.read()

    result = await analyze_utility_bill(
        pdf_bytes=pdf_bytes,
        filename=file.filename or "utility_bill.pdf",
    )

    return {
        "filename": file.filename,
        "verification_report": result,
    }