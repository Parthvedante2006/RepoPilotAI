def generate_memory_cards(quiz):
    cards = []

    for q in quiz:
        cards.append({
            "front": q["question"],
            "back": q["answer"]
        })

    return cards

