import MCQGame from "./games/MCQGame";
import DragDropGame from "./games/DragDropGame";
import MemoryGame from "./games/MemoryGame";
import SequenceGame from "./games/SequenceGame";
import DailyPracticeGame from "./games/DailyPracticeGame";

export default function PlayQuiz({ quiz }) {
  switch (quiz.gameType) {
    case "mcq": return <MCQGame quiz={quiz} />;
    case "drag": return <DragDropGame quiz={quiz} />;
    case "memory": return <MemoryGame quiz={quiz} />;
    case "sequence": return <SequenceGame quiz={quiz} />;
    case "daily": return <DailyPracticeGame quiz={quiz} />;
    default: return <p>Invalid game</p>;
  }
}




