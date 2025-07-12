from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Literal
import ollama
import json
import os

router = APIRouter()

class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: str  # Add model field

@router.get("/models")
async def get_models():
    base_dir = os.path.dirname(__file__)
    model_data_path = os.path.join(base_dir, "../../data/model_data.json")

    with open(model_data_path) as f:
        model_data = json.load(f)

    return model_data

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:

        # Start the streaming chat with Ollama
        stream = ollama.chat(
            model=request.model,  # Use the model from the request
            messages=[msg.model_dump() for msg in request.messages],
            stream=True
        )

        def stream_generator():
            for chunk in stream:
                content = chunk.get("message", {}).get("content", "")
                yield content  # This yields small bits to the frontend

        return StreamingResponse(stream_generator(), media_type="text/plain")

    except Exception as e:
        print("❌ ERROR in /chat endpoint:", str(e))
        return {"error": str(e)}
