from google import genai
from config import GEMINI_API_KEY
import json
import re

client = genai.Client(api_key=GEMINI_API_KEY)

def generate_quiz(text, difficulty="medium"):
    """
    Generates 50 concept-based MCQs using Gemini
    """

    prompt = f"""
You are an expert teacher and question designer.

Read the study material carefully and generate
HIGH-QUALITY, CONCEPTUAL MCQs.

Rules:
- Generate EXACTLY 50 questions
- Difficulty: {difficulty}
- Test understanding (why, how, difference, application)
- Each question has 4 options
- ONLY ONE correct answer
- Answer must be FULL OPTION TEXT
- NO markdown, NO explanation
- Output ONLY valid JSON

Study Material:
{text}

JSON format:
[
  {{
    "question": "Question text",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "answer": "Correct option text"
  }}
]
"""

    response = client.models.generate_content(
        model="models/gemini-2.5-flash",
        contents=prompt
    )

    raw = response.text.strip()
    raw = re.sub(r"```json|```", "", raw).strip()

    try:
        return json.loads(raw)
    except Exception:
        print("❌ Gemini JSON parse failed")
        print(raw)
        return []


