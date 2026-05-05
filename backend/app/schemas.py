from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models import StatusEnum

class JobApplicationBase(BaseModel):
    company: str
    role: str
    status: StatusEnum = StatusEnum.wishlist
    job_url: Optional[str] = None
    notes: Optional[str] = None
    salary_range: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    applied_date: Optional[str] = None

class JobApplicationCreate(JobApplicationBase):
    pass

class JobApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    status: Optional[StatusEnum] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None
    salary_range: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    applied_date: Optional[str] = None

class JobApplicationOut(JobApplicationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EmailRequest(BaseModel):
    job_id: int
    email_type: str  # "follow_up" | "thank_you" | "withdraw"
    custom_context: Optional[str] = None

class EmailResponse(BaseModel):
    subject: str
    body: str
