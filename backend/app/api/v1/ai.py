from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.core.ai import get_ai_provider
from app.core.deps import get_current_active_user

router = APIRouter(prefix="/ai", tags=["AI Features"])


class SummaryRequest(BaseModel):
    transcript_text: str


class QuizGenRequest(BaseModel):
    content_text: str
    num_questions: int = 5


class ChatAssistantRequest(BaseModel):
    course_context: str
    question: str


@router.post("/summarize")
async def summarize_lesson_ai(
    req: SummaryRequest, current_user=Depends(get_current_active_user)
):
    ai = get_ai_provider()
    return await ai.summarize_lesson(req.transcript_text)


@router.post("/generate-quiz")
async def generate_quiz_ai(
    req: QuizGenRequest, current_user=Depends(get_current_active_user)
):
    ai = get_ai_provider()
    return await ai.generate_quiz_questions(req.content_text, req.num_questions)


@router.post("/chat")
async def course_ai_assistant(
    req: ChatAssistantRequest, current_user=Depends(get_current_active_user)
):
    ai = get_ai_provider()
    answer = await ai.answer_course_question(req.course_context, req.question)
    return {"answer": answer}
