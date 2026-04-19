from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.models.chat import ChatRequest
from app.services.chat_service import stream_miriam_response

router = APIRouter()


@router.post("")
async def miriam_chat(req: ChatRequest):
    return StreamingResponse(
        stream_miriam_response(
            [m.model_dump() for m in req.messages],
            req.user_message,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
