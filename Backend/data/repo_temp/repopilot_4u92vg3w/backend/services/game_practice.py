def generate_practice(quiz):
    practice = []

    for q in quiz:
        practice.append({
            "question": q["question"],
            "answer": q["answer"]
        })

    return practice


