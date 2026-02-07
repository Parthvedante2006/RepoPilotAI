import { useState, useEffect } from "react";

export default function MemoryGame({ questions, onFinish }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    const selected = questions.slice(0, 8); // 8 pairs max
    const cardPairs = selected.flatMap((q, i) => [
      { id: `q${i}`, fullContent: q.question, content: q.question.length > 40 ? q.question.slice(0, 37) + "..." : q.question, type: "question", pairId: i },
      { id: `a${i}`, fullContent: q.answer, content: q.answer.length > 40 ? q.answer.slice(0, 37) + "..." : q.answer, type: "answer", pairId: i },
    ]);
    setCards(cardPairs.sort(() => Math.random() - 0.5));
  }, [questions]);

  const handleFlip = (card) => {
    if (flipped.length === 2 || flipped.includes(card.id) || matched.includes(card.pairId)) return;
    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);
    setMoves(moves + 1);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped.map(id => cards.find(c => c.id === id));
      if (first.pairId === second.pairId) {
        setMatched([...matched, first.pairId]);
      }
      setTimeout(() => setFlipped([]), 1200);
    }
  };

  const handleCardClick = (card) => {
    if (isFlipped(card) && card.fullContent.length > 40) {
      setExpandedCard(card);
    }
  };

  useEffect(() => {
    if (matched.length === cards.length / 2 && cards.length > 0) {
      onFinish(matched.length);
    }
  }, [matched, cards.length, onFinish]);

  const isFlipped = (card) => flipped.includes(card.id) || matched.includes(card.pairId);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center p-0 overflow-hidden transition-colors">
      <div className="w-screen bg-white dark:bg-gray-900 rounded-none shadow-none md:shadow-2xl p-6 md:p-10 lg:p-12 border-0 md:border border-indigo-200 dark:border-indigo-800 flex flex-col min-h-screen transition-colors">
        {/* Instructions */}
        <div className="mb-12 text-center px-2 md:px-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Memory Match Challenge
          </h2>
          <p className="text-2xl text-gray-700 dark:text-gray-300 mb-4">
            How to Play:
          </p>
          <ul className="text-xl text-gray-600 dark:text-gray-400 list-disc list-inside mx-auto space-y-2 max-w-4xl">
            <li>Flip two cards to find matching question-answer pairs</li>
            <li>Click a flipped card to see full text if truncated</li>
            <li>Match all pairs to win the game</li>
            <li>Score: Fewer moves = better (moves count flips)</li>
          </ul>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-12 md:gap-16 text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-12 px-2 md:px-4">
          <span>Moves: {moves}</span>
          <span>Matches: {matched.length} / {cards.length / 2}</span>
        </div>

        {/* Grid - Full width */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10 px-2 md:px-4">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => {
                handleFlip(card);
                handleCardClick(card);
              }}
              className="relative h-48 md:h-64 rounded-3xl cursor-pointer transform transition-all duration-700 preserve-3d hover:scale-105"
            >
              {/* Back */}
              <div
                className={`absolute inset-0 w-full h-full rounded-3xl shadow-2xl flex items-center justify-center text-6xl font-bold backface-hidden ${
                  isFlipped(card) ? "rotate-y-180" : ""
                } bg-gradient-to-r from-indigo-500 to-blue-600 text-white`}
              >
                ?
              </div>

              {/* Front */}
              <div
                className={`absolute inset-0 w-full h-full rounded-3xl shadow-2xl flex items-center justify-center p-4 text-center backface-hidden ${
                  isFlipped(card) ? "" : "rotate-y-180"
                } bg-white dark:bg-gray-700 border-4 ${
                  card.type === "question" ? "border-pink-400" : "border-teal-400"
                } text-gray-900 dark:text-white text-lg md:text-xl font-medium leading-tight overflow-hidden`}
              >
                {card.content}
              </div>
            </div>
          ))}
        </div>

        {/* Win Message */}
        {matched.length === cards.length / 2 && cards.length > 0 && (
          <div className="text-center mt-20 p-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl text-white shadow-2xl mx-2 md:mx-4">
            <h2 className="text-5xl font-bold mb-6">Memory Master! 🏆</h2>
            <p className="text-3xl">Completed in {moves} moves!</p>
          </div>
        )}
      </div>

      {/* Expanded Card Modal */}
      {expandedCard && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 max-w-4xl w-full border-4 border-indigo-300 dark:border-indigo-900/30 shadow-2xl">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Full {expandedCard.type.charAt(0).toUpperCase() + expandedCard.type.slice(1)}
            </h3>
            <p className="text-2xl text-gray-700 dark:text-gray-300 leading-relaxed">
              {expandedCard.fullContent}
            </p>
            <button
              onClick={() => setExpandedCard(null)}
              className="mt-8 px-10 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xl font-bold rounded-full shadow-xl transition transform hover:scale-105 w-full md:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}


