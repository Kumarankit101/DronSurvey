# main.py
from fastapi import FastAPI, Request,Depends, HTTPException, Cookie
from sse_starlette.sse import EventSourceResponse
from starlette.middleware.cors import CORSMiddleware
import asyncio
import os
from dotenv import load_dotenv
import jwt 

from llm import stream_llm_response_with_context  
from db import get_all_database_data_cached        

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET = os.getenv("JWT_SECRET", "drone-survey-secret-key")
print(SECRET)

def get_user_from_jwt(token: str = Cookie(None)):
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        # print(payload)
        return payload["userId"]
    except Exception as e:
        print(f"JWT Authentication Error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/chat/stream")
async def stream_chat(request: Request, user_id: str = Depends(get_user_from_jwt)):
    body = await request.json()
    messages = body.get("messages")
    
    # Get the user's latest query
    user_query = messages[-1]["parts"][0]["text"]

    # Retrieve the entire database summary from Supabase (cached or not)
    db_context = await get_all_database_data_cached()

    # Build conversation history while filtering duplicates.
    conversation_history = build_conversation_history(messages)
    
    # Create the final prompt combining context and conversation.
    final_prompt = (
        "You are a mission assistant with access to the drone and mission database.\n\n"
        f" Database Context:\n{db_context}\n\n"
        f" Conversation History:\n{conversation_history}\n\n"
        " Using the above information, respond accurately to the latest user message."
    )
    
    async def event_generator():
        try:
            async for content in stream_llm_response_with_context(final_prompt):
                yield f"data: {content}\n\n"
                await asyncio.sleep(0.02)
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"
    
    return EventSourceResponse(event_generator())



def build_conversation_history(messages) -> str:

    history_lines = []
    previous_text = None
    previous_role = None
    for msg in messages:
        # Convert role: ensure that model messages are flagged as "model", and user as "user"
        role = msg.get("role", "user")
        text = msg["parts"][0]["text"].strip()
        # Skip if the text and role are the same as the previous message.
        if previous_text == text and previous_role == role:
            continue
        history_lines.append(f"{role}: {text}")
        previous_text = text
        previous_role = role
    return "\n".join(history_lines)


@app.get("/")
async def root():
    return {"message": "LLM SSE Service running"}
