def build_prompt(question, retrieved_chunks, question_meta=None, overview_signals=None):
    if not question or not isinstance(question, str):
        raise ValueError("question must be a non-empty string")
    
    if not isinstance(retrieved_chunks, list):
        raise ValueError("retrieved_chunks must be a list")
    
    context = ""
    
    if retrieved_chunks:
        for i, chunk in enumerate(retrieved_chunks, start=1):
            context += f"""
[CHUNK {i}]
File: {chunk.get('file', 'Unknown')}
Chunk ID: {chunk.get('chunk_id', 'N/A')}
Distance: {chunk.get('distance', 'N/A')}
Content:
{chunk.get('text', '')}
"""
    else:
        context = "[No relevant code found in the repository]"
    
    prompt = f"""You are a senior software engineer assistant.

Your task:
1. Answer the user's question using ONLY the provided code context
2. Do NOT guess or use outside knowledge
3. If the answer is not present in the context, say clearly: "Not enough information in the repository to answer this question."
4. Always mention file names when referencing code
5. Be clear, concise, and technical

User Question:
"{question}"

Code Context:
{context}

Rules:
- Reference specific file names in your answer
- Quote code when relevant
- Explain what you found, not what you think might be there
- If multiple chunks are provided, connect them logically
- Do NOT make assumptions about code not shown

Answer:
"""
    
    return prompt


if __name__ == "__main__":
    example_question = "Where is authentication handled?"
    example_chunks = [
        {
            "file": "src/auth/login.py",
            "chunk_id": 1,
            "distance": 0.1234,
            "text": "def login(user, password):\n    if validate_user(user, password):\n        return create_session(user)\n    return None"
        }
    ]
    
    prompt = build_prompt(example_question, example_chunks)
    print(prompt)