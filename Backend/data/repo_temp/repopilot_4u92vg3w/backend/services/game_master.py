from services.game_mcq import generate_mcq
from services.game_drag_drop import generate_drag_drop
from services.game_memory import generate_memory_cards
from services.game_sequence import generate_sequence
from services.game_practice import generate_practice

def generate_all_games(quiz):
    return {
        "mcq": generate_mcq(quiz),
        "drag_drop": generate_drag_drop(quiz),
        "memory_cards": generate_memory_cards(quiz),
        "sequence_builder": generate_sequence(quiz),
        "daily_practice": generate_practice(quiz)
    }


