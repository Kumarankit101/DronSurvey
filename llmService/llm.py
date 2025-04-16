# llm.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def stream_llm_response_with_context(final_prompt: str):
    model = genai.GenerativeModel(model_name="gemini-2.0-flash")
    # Start a new chat with the complete prompt.
    convo = model.start_chat(history=[{"role": "user", "parts": [{"text": final_prompt}]}])
    response = await convo.send_message_async(final_prompt, stream=True)
    async for chunk in response:
        yield chunk.text
