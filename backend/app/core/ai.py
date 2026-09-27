from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from app.core.config import settings


class AIProvider(ABC):
    @abstractmethod
    async def summarize_lesson(self, transcript_text: str) -> Dict[str, Any]:
        """Generates AI summary and key learning objectives from lesson transcript."""
        pass

    @abstractmethod
    async def generate_quiz_questions(
        self, content_text: str, num_questions: int = 5
    ) -> List[Dict[str, Any]]:
        """Generates multiple choice quiz questions based on lesson content."""
        pass

    @abstractmethod
    async def answer_course_question(
        self, course_context: str, user_question: str
    ) -> str:
        """RAG response for course student assistant."""
        pass


class MockAIProvider(AIProvider):
    async def summarize_lesson(self, transcript_text: str) -> Dict[str, Any]:
        return {
            "summary": "This lesson covers fundamental architectural patterns, domain design, and best practices.",
            "learning_objectives": [
                "Understand modular domain architecture",
                "Apply clean design principles",
                "Implement secure endpoints and validation",
            ],
            "estimated_reading_minutes": 5,
        }

    async def generate_quiz_questions(
        self, content_text: str, num_questions: int = 5
    ) -> List[Dict[str, Any]]:
        return [
            {
                "question_text": "What is the primary benefit of using a decoupled storage provider interface?",
                "options": [
                    {"text": "Allows swapping between local, S3, or Azure Blob without changing business logic", "is_correct": True},
                    {"text": "Makes video files smaller automatically", "is_correct": False},
                    {"text": "Bypasses database authentication", "is_correct": False},
                    {"text": "Increases server bandwidth by 10x", "is_correct": False},
                ],
                "explanation": "Decoupled abstractions keep business logic provider-agnostic.",
            },
            {
                "question_text": "Why must payment verification happen on the backend server?",
                "options": [
                    {"text": "Frontend responses can be manipulated by malicious clients", "is_correct": True},
                    {"text": "Frontend browsers cannot calculate HMAC signatures", "is_correct": False},
                    {"text": "To hide the price of the course", "is_correct": False},
                    {"text": "PostgreSQL requires backend database connections", "is_correct": False},
                ],
                "explanation": "Backend signature/webhook verification prevents payment forgery.",
            },
        ]

    async def answer_course_question(
        self, course_context: str, user_question: str
    ) -> str:
        return f"Based on the course materials: Regarding '{user_question}', make sure to follow the recommended domain boundaries, use strong encryption, and check transaction logs for verification."


def get_ai_provider() -> AIProvider:
    return MockAIProvider()
