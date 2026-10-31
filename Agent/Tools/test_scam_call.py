from scam_call_detection_tool import (
    scam_call_detection_tool,
    reset_call_session,
)


# Unique ID for this phone call
call_id = "call_001"


# First 4-second chunk
chunk_1 = """
Caller: Hello, I am calling from your bank's security department.
"""

result_1 = scam_call_detection_tool.invoke(
    {
        "call_id": call_id,
        "transcript_chunk": chunk_1,
    }
)

print("\n========== ANALYSIS 1 ==========\n")
print(result_1)


# Second 4-second chunk
chunk_2 = """
Caller: We detected suspicious activity on your account.
Your account may be blocked if you do not verify your identity.
"""

result_2 = scam_call_detection_tool.invoke(
    {
        "call_id": call_id,
        "transcript_chunk": chunk_2,
    }
)

print("\n========== ANALYSIS 2 ==========\n")
print(result_2)


# Third 4-second chunk
chunk_3 = """
Caller: We have sent you an OTP. Please tell me the code
so I can secure your account.
"""

result_3 = scam_call_detection_tool.invoke(
    {
        "call_id": call_id,
        "transcript_chunk": chunk_3,
    }
)

print("\n========== ANALYSIS 3 ==========\n")
print(result_3)


# Clear the session when the call has ended.
reset_call_session(call_id)