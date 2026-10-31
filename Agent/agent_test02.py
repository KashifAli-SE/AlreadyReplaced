import asyncio

from agent import detect_call_chunk


async def main():
    call_id = "call_1001"

    chunks = [
        "Caller: Hello, I am calling from your bank.",

        "Caller: We detected suspicious activity on your account.",

        "Caller: Please tell me the OTP you just received.",

    ]

    for chunk in chunks:

        result = await detect_call_chunk(
            call_id=call_id,
            transcript_chunk=chunk,
        )

        print("\n==========================")
        print("NEW TRANSCRIPT CHUNK")
        print("==========================")

        print(result)

        # Simulate the next chunk arriving four seconds later.
        await asyncio.sleep(4)


if __name__ == "__main__":
    asyncio.run(main())