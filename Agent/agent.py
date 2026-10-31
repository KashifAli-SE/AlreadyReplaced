import os
from typing import Literal, Optional
from typing_extensions import TypedDict

from langgraph.graph import StateGraph, START, END

from Tools.scam_msgs_tool import scam_detection_tool
from Tools.scam_call_detection_tool import scam_call_detection_tool


# ============================================================
# 1. AGENT STATE
# ============================================================

class DetectionState(TypedDict, total=False):
    """
    State shared between LangGraph nodes.

    task:
        Type of detection: "message" or "call".

    message:
        Message to check for scams.

    call_id:
        Unique identifier for the phone call.

    transcript_chunk:
        Latest four-second transcript chunk.

    result:
        Result returned by the selected detection tool.

    error:
        Error message, if something goes wrong.
    """

    task: str
    message: str
    call_id: str
    transcript_chunk: str
    result: str
    error: str


# ============================================================
# 2. MESSAGE DETECTION NODE
# ============================================================

async def message_detection_node(
    state: DetectionState,
) -> DetectionState:
    """
    Analyze a message using the scam detection tool.
    """

    message = state.get("message", "").strip()

    if not message:
        return {
            "error": "A message is required for scam detection."
        }

    try:
        result = await scam_detection_tool.ainvoke(
            {
                "message": message,
            }
        )

        return {
            "result": str(result),
            "error": "",
        }

    except Exception as exc:
        return {
            "error": f"Message detection failed: {str(exc)}"
        }


# ============================================================
# 3. PHONE CALL DETECTION NODE
# ============================================================

async def call_detection_node(
    state: DetectionState,
) -> DetectionState:
    """
    Analyze the latest transcript chunk of a phone call.

    The existing scam_call_detection_tool maintains the
    accumulated transcript for each call_id.
    """

    call_id = state.get("call_id", "").strip()
    transcript_chunk = state.get(
        "transcript_chunk", ""
    ).strip()

    if not call_id:
        return {
            "error": "A call_id is required for call detection."
        }

    if not transcript_chunk:
        return {
            "error": "A transcript chunk is required."
        }

    try:
        result = await scam_call_detection_tool.ainvoke(
            {
                "call_id": call_id,
                "transcript_chunk": transcript_chunk,
            }
        )

        return {
            "result": str(result),
            "error": "",
        }

    except Exception as exc:
        return {
            "error": f"Call detection failed: {str(exc)}"
        }


# ============================================================
# 4. TASK ROUTER
# ============================================================

def route_task(
    state: DetectionState,
) -> Literal["message_detection", "call_detection", "invalid_task"]:
    """
    Select the appropriate workflow based on the task.
    """

    task = state.get("task", "").strip().lower()

    if task == "message":
        return "message_detection"

    if task == "call":
        return "call_detection"

    return "invalid_task"


# ============================================================
# 5. INVALID TASK NODE
# ============================================================

def invalid_task_node(
    state: DetectionState,
) -> DetectionState:
    """
    Handle unsupported task types.
    """

    return {
        "error": (
            "Invalid task. Supported tasks are "
            "'message' and 'call'."
        )
    }


# ============================================================
# 6. BUILD LANGGRAPH WORKFLOW
# ============================================================

def build_detection_graph():
    """
    Build and compile the LangGraph detection workflow.
    """

    workflow = StateGraph(DetectionState)

    # Register nodes.
    workflow.add_node(
        "message_detection",
        message_detection_node,
    )

    workflow.add_node(
        "call_detection",
        call_detection_node,
    )

    workflow.add_node(
        "invalid_task",
        invalid_task_node,
    )

    # Route incoming requests.
    workflow.add_conditional_edges(
        START,
        route_task,
        {
            "message_detection": "message_detection",
            "call_detection": "call_detection",
            "invalid_task": "invalid_task",
        },
    )

    # End after processing.
    workflow.add_edge(
        "message_detection",
        END,
    )

    workflow.add_edge(
        "call_detection",
        END,
    )

    workflow.add_edge(
        "invalid_task",
        END,
    )

    return workflow.compile()


# Compile the graph once when the module is loaded.
detection_agent = build_detection_graph()


# ============================================================
# 7. PUBLIC API: CHECK A MESSAGE
# ============================================================

async def detect_message(message: str) -> dict:
    """
    Public function for message scam detection.
    """

    result = await detection_agent.ainvoke(
        {
            "task": "message",
            "message": message,
        }
    )

    return {
        "task": "message",
        "result": result.get("result"),
        "error": result.get("error"),
    }


# ============================================================
# 8. PUBLIC API: CHECK A PHONE CALL CHUNK
# ============================================================

async def detect_call_chunk(
    call_id: str,
    transcript_chunk: str,
) -> dict:
    """
    Public function for incremental phone call detection.

    Call this whenever a new transcript chunk arrives.
    """

    result = await detection_agent.ainvoke(
        {
            "task": "call",
            "call_id": call_id,
            "transcript_chunk": transcript_chunk,
        }
    )

    return {
        "task": "call",
        "call_id": call_id,
        "result": result.get("result"),
        "error": result.get("error"),
    }


# ============================================================
# 9. OPTIONAL: COMMAND-LINE TEST
# ============================================================

async def main():
    import asyncio

    print("\nScam Detection Agent")
    print("====================")

    while True:
        print("\n1. Check a message")
        print("2. Check a phone call transcript chunk")
        print("3. Exit")

        choice = input("\nSelect an option: ").strip()

        if choice == "1":
            message = input("\nEnter the message: ")

            result = await detect_message(message)

            print("\n--- Detection Result ---")
            print(result)

        elif choice == "2":
            call_id = input("\nEnter the call ID: ").strip()

            transcript_chunk = input(
                "Enter the latest transcript chunk: "
            ).strip()

            result = await detect_call_chunk(
                call_id=call_id,
                transcript_chunk=transcript_chunk,
            )

            print("\n--- Call Detection Result ---")
            print(result)

        elif choice == "3":
            print("Exiting agent.")
            break

        else:
            print("Invalid option. Please try again.")


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())