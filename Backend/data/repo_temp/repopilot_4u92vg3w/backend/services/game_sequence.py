import random

def generate_sequence(quiz):
    sequences = []

    for q in quiz:
        shuffled = q["options"].copy()
        random.shuffle(shuffled)

        sequences.append({
            "question": q["question"],
            "items": shuffled,
            "correct_order": q["options"]
        })

    return sequences


