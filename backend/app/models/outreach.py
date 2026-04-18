from typing import Literal
from datetime import datetime
from pydantic import BaseModel

OutreachStatus = Literal["inviato", "in_attesa", "risposto", "trattativa", "chiuso"]


class OutreachEntry(BaseModel):
    id: str
    supplier_id: str
    supplier_name: str
    product_query: str
    status: OutreachStatus
    sent_at: datetime
    last_update: datetime
    note: str | None = None
    session_id: str


class CreateOutreachRequest(BaseModel):
    supplier_id: str
    supplier_name: str
    product_query: str
    session_id: str


class UpdateOutreachRequest(BaseModel):
    status: OutreachStatus | None = None
    note: str | None = None
