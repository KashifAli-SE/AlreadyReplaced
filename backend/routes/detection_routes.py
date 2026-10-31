from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from Agent.agent import detect_message, detect_call_chunk


router = APIRouter(
    prefix="/detect",
    tags=["Scam Detection"],
)


# ============================================================
# REQUEST MODELS
# ============================================================

class MessageDetectionRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        description="Message to analyze for potential scams",
    )


class CallDetectionRequest(BaseModel):
    call_id: str = Field(
        ...,
        min_length=1,
        description="Unique ID identifying the phone call",
    )

    transcript_chunk: str = Field(
        ...,
        min_length=1,
        description="Latest transcript chunk from the phone call",
    )


# ============================================================
# MESSAGE DETECTION ENDPOINT
# ============================================================

@router.post("/message")
async def check_message(request: MessageDetectionRequest):
    """
    Analyze a message for potential scam indicators.
    """

    try:
        result = await detect_message(
            message=request.message
        )

        if result.get("error"):
            raise HTTPException(
                status_code=502,
                detail=result["error"],
            )

        return {
            "success": True,
            "task": "message",
            "result": result["result"],
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Message detection failed.",
        )


# ============================================================
# PHONE CALL DETECTION ENDPOINT
# ============================================================

@router.post("/call")
async def check_call(request: CallDetectionRequest):
    """
    Analyze the latest chunk of an ongoing phone call.

    Reuse the same call_id for every chunk belonging
    to the same phone call.
    """

    try:
        result = await detect_call_chunk(
            call_id=request.call_id,
            transcript_chunk=request.transcript_chunk,
        )

        if result.get("error"):
            raise HTTPException(
                status_code=502,
                detail=result["error"],
            )

        return {
            "success": True,
            "task": "call",
            "call_id": request.call_id,
            "result": result["result"],
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Phone call detection failed.",
        )
