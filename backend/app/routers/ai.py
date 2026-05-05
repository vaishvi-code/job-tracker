from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.config import settings
import httpx
import json

router = APIRouter(prefix="/ai", tags=["ai"])

EMAIL_TYPE_PROMPTS = {
    "follow_up": "Write a concise, professional follow-up email checking on the status of a job application.",
    "thank_you": "Write a warm, professional thank-you email after a job interview.",
    "withdraw": "Write a polite, professional email to withdraw from the application process.",
}

@router.post("/generate-email", response_model=schemas.EmailResponse)
def generate_email(request: schemas.EmailRequest, db: Session = Depends(get_db)):
    job = db.query(models.JobApplication).filter(models.JobApplication.id == request.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    base_prompt = EMAIL_TYPE_PROMPTS.get(request.email_type)
    if not base_prompt:
        raise HTTPException(status_code=400, detail="Invalid email type. Use: follow_up, thank_you, or withdraw")

    prompt = f"""
{base_prompt}

Job details:
- Company: {job.company}
- Role: {job.role}
- Contact name: {job.contact_name or "Hiring Manager"}
- Applied date: {job.applied_date or "recently"}
{f"- Additional context: {request.custom_context}" if request.custom_context else ""}

Respond ONLY with a JSON object in this exact format (no markdown, no extra text):
{{"subject": "email subject here", "body": "full email body here"}}
"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.gemini_api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1024}
    }

    try:
        response = httpx.post(url, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        result = json.loads(text.strip())
        return schemas.EmailResponse(subject=result["subject"], body=result["body"])
    except httpx.HTTPStatusError as e:
        print(f"Gemini HTTP error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=500, detail=f"Gemini error: {e.response.text}")
    except Exception as e:
        print(f"Email generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")
