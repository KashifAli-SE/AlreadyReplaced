
from scam_msgs_tool import scam_detection_tool

message = """
Congratulations! You have won Rs. 100,000.
Click this link immediately and enter your bank OTP
to receive your prize.
"""

result = scam_detection_tool.invoke({
    "message": message
})

print(result)