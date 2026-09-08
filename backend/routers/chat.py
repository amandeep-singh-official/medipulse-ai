import time
from collections import defaultdict
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from config import get_supabase_client
from routers.reports import get_user_id
from services.ai_service import stream_chat_response, generate_chat_suggestions

router = APIRouter(prefix="/api/chat", tags=["chat"])

# ─── Rate Limiter (in-memory, per user) ──────────────────────────────────────
# NOTE: Resets on server restart and is not shared across workers.
# This is intentional for V1 — good enough for portfolio/dev use.
_rate_limit_store: dict = defaultdict(list)
RATE_LIMIT_MAX = 20        # max requests
RATE_LIMIT_WINDOW = 60     # per 60 seconds


def check_rate_limit(user_id: str) -> None:
    """Allow max 20 requests per user per 60 seconds."""
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW
    # Keep only requests in the current window
    _rate_limit_store[user_id] = [
        ts for ts in _rate_limit_store[user_id] if ts > window_start
    ]
    if len(_rate_limit_store[user_id]) >= RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. You can send up to {RATE_LIMIT_MAX} messages per minute."
        )
    _rate_limit_store[user_id].append(now)


# ─── Pydantic Models ──────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., min_length=1, max_length=20000)  # large enough for AI responses in history


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., min_length=1, max_length=50)


# ─── Helper: Fetch Deduplicated Latest Biomarkers ────────────────────────────

def get_latest_biomarkers(user_id: str) -> list:
    """
    Fetch user's most recent biomarker reading per biomarker name.
    Deduplicates so we get one row per biomarker (latest only).
    Capped at 30 to prevent context bloat.
    """
    supabase = get_supabase_client()

    reports = (
        supabase.table("reports")
        .select("id, report_date")
        .eq("user_id", user_id)
        .order("report_date", desc=True)
        .execute()
    )
    if not reports.data:
        return []

    report_ids = [r["id"] for r in reports.data]

    biomarkers = (
        supabase.table("biomarkers")
        .select("name, value, unit, ref_min, ref_max, status, report_id")
        .in_("report_id", report_ids)
        .execute()
    )

    if not biomarkers.data:
        return []

    # Build report_date lookup
    report_date_map = {r["id"]: r["report_date"] for r in reports.data}

    # Attach report_date to each biomarker and sort by date desc
    enriched = []
    for bm in biomarkers.data:
        bm["report_date"] = report_date_map.get(bm["report_id"], "")
        enriched.append(bm)

    enriched.sort(key=lambda x: x.get("report_date") or "", reverse=True)

    # Deduplicate: keep only latest reading per biomarker name
    seen = set()
    deduplicated = []
    for bm in enriched:
        if bm["name"] not in seen:
            seen.add(bm["name"])
            deduplicated.append(bm)
        if len(deduplicated) >= 30:
            break

    return deduplicated


# ─── POST /api/chat ───────────────────────────────────────────────────────────

@router.post("")
async def chat(
    body: ChatRequest,
    authorization: Optional[str] = Header(None),
):
    """
    Streaming chat endpoint. Returns plain text stream (streamProtocol: 'text').
    Compatible with Vercel AI SDK useChat() with streamProtocol: 'text'.
    """
    user_id = get_user_id(authorization)
    check_rate_limit(user_id)

    # Validate message length on backend too
    last_msg = body.messages[-1].content
    if len(last_msg.strip()) < 2:
        raise HTTPException(status_code=400, detail="Message is too short.")
    if len(last_msg) > 1000:
        raise HTTPException(status_code=400, detail="Message exceeds 1000 character limit.")

    # Fetch user's latest deduplicated biomarkers
    biomarkers = get_latest_biomarkers(user_id)

    # Convert pydantic messages to plain dicts for ai_service
    messages = [{"role": m.role, "content": m.content} for m in body.messages]

    def generate():
        try:
            yield from stream_chat_response(messages, biomarkers)
        except Exception as e:
            print(f"[Chat] Unexpected streaming error: {e}")
            yield "\n\nI encountered an error. Please try again."

    return StreamingResponse(
        generate(),
        media_type="text/plain",
        headers={
            # Allow the frontend to read this header cross-origin (CORS)
            "Access-Control-Expose-Headers": "Content-Type",
            # Disable buffering on nginx/proxies so tokens stream immediately
            "X-Accel-Buffering": "no",
            "Cache-Control": "no-cache",
        },
    )


# ─── GET /api/chat/suggestions ────────────────────────────────────────────────

@router.get("/suggestions")
async def get_suggestions(authorization: Optional[str] = Header(None)):
    """
    Returns contextual suggested questions based on the user's out-of-range biomarkers.
    Called once when the chat widget opens.
    """
    user_id = get_user_id(authorization)
    biomarkers = get_latest_biomarkers(user_id)
    suggestions = generate_chat_suggestions(biomarkers)
    return {"suggestions": suggestions, "has_data": len(biomarkers) > 0}
