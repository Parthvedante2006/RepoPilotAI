def generate_drag_drop(quiz):
    games = []

    for q in quiz:
        games.append({
            "question": q["question"],
            "items": q["options"],
            "answer": q["answer"]
        })

    return games

