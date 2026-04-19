from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str  # 'user' | 'assistant'
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    user_message: str


class SearchContext(BaseModel):
    refined_query: str
    positioning: str  # 'mass_market' | 'artisanal' | 'premium' | 'dropshipping' | 'unknown'
    market: str       # 'global' | 'US' | 'IT' | ...
    channel: str      # 'online' | 'store' | 'dropshipping'
    target_customer: str
    supplier_context: str
