import asyncio

from agent import detect_message


async def main():
    message = """
    Your bank account will be blocked today.
    Send us your OTP immediately to prevent suspension.
    """

    result = await detect_message(message)

    print(result)


if __name__ == "__main__":
    asyncio.run(main())