from google import genai
from config import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)

PROJECT_CONTEXT = """
Project Name:
AI-Powered Gamified Learning & Quiz Management Platform

Project Summary:
This is a full-stack education platform where teachers create classrooms,
upload PDFs or text, generate AI-based quizzes, convert them into 5 interactive
game formats, and assign them to students. Students join classrooms, attempt
quizzes, view results, leaderboards, and also create self-practice quizzes.

Teacher Features:
- Create classrooms
- Upload PDFs (max 15 pages) or text
- AI generates 50 MCQs
- Edit & finalize questions
- Assign quizzes to classrooms
- Track performance
- Use AI chatbot

Student Features:
- Join classrooms via code
- Attempt quizzes
- Play 5 game types:
  MCQ, Drag & Drop, Practice, Memory, Sequence
- View results & leaderboards
- Create self-practice quizzes
- Use AI chatbot

Tech Stack:
Frontend: React, Tailwind, Firebase
Backend: Flask, Gemini AI, PyPDF2
"""

def chatbot_reply(user_message: str):
    """
    Smart chatbot:
    - Answers project-related questions accurately
    - Answers general questions normally
    """

    prompt = f"""
You are an intelligent AI assistant.

You already know about this project:
{PROJECT_CONTEXT}

Instructions:
- If the user's question is related to this project, answer using the project details.
- If the question is NOT related to the project, answer normally with correct information.
- Be clear, simple, and professional.
- Do not mention that you were given project context unless asked.

User Question:
{user_message}
"""

    response = client.models.generate_content(
        model="models/gemini-2.5-flash",
        contents=prompt
    )

    return response.text.strip()


