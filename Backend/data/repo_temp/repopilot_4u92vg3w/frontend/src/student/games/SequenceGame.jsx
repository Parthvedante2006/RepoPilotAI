import { useState, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Confetti from "react-confetti";

const SortableItem = ({ id, text, index, disabled }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(disabled ? {} : attributes)}
      {...(disabled ? {} : listeners)}
      className={`flex items-center gap-6 px-8 py-6 rounded-2xl text-xl md:text-2xl font-bold shadow-lg transition-all duration-300 min-w-[300px] snap-center
        ${disabled ? "opacity-60 cursor-not-allowed bg-gray-300 dark:bg-gray-700" : isDragging ? "scale-105 shadow-2xl ring-4 ring-indigo-400" : "bg-gradient-to-r from-indigo-500 to-blue-600 text-white cursor-grab hover:scale-105 hover:shadow-xl"}`}
    >
      <span className="text-3xl md:text-4xl">{index + 1}</span>
      <span>{text}</span>
    </div>
  );
};

export default function SequenceGame({ questions, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [confettiActive, setConfettiActive] = useState(false);
  const [userSequences, setUserSequences] = useState({}); // ← NEW: saves previous sequences

  const sensors = useSensors(useSensor(PointerSensor));

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  useEffect(() => {
    if (question) {
      const prevSeq = userSequences[currentIndex];
      if (prevSeq) {
        // Load previous sequence when going back
        setItems(prevSeq.map((text, i) => ({ id: `item-${i}`, text })));
        setShowResult(true);
      } else {
        const shuffled = [...question.options].sort(() => Math.random() - 0.5);
        setItems(shuffled.map((text, i) => ({ id: `item-${i}`, text })));
        setShowResult(false);
      }
      setIsCorrect(false);
    }
  }, [currentIndex, question, userSequences]);

  const handleDragEnd = (event) => {
    if (showResult) return; // ← Prevent dragging if already submitted

    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = () => {
    if (showResult) return;

    const userOrder = items.map((i) => i.text);
    const correct = JSON.stringify(userOrder) === JSON.stringify(question.options);
    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1);
      setConfettiActive(true);
      setTimeout(() => setConfettiActive(false), 3000);
    }
    setShowResult(true);

    // Save sequence so back shows it locked
    setUserSequences(prev => ({
      ...prev,
      [currentIndex]: userOrder
    }));
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish(score + (isCorrect ? 1 : 0));
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center p-0 overflow-hidden transition-colors">
      {confettiActive && <Confetti numberOfPieces={250} gravity={0.2} />}

      <div className="w-screen bg-white dark:bg-gray-900 rounded-none shadow-none md:shadow-2xl p-6 md:p-10 lg:p-12 border-0 md:border border-indigo-200 dark:border-indigo-800 flex flex-col min-h-screen transition-colors">
        {/* Header */}
        <div className="mb-6 md:mb-8 px-4 md:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent mb-6 lg:mb-8">
            Sequence Builder
          </h2>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-lg md:text-xl font-medium text-gray-900 dark:text-gray-100">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span className="text-indigo-600 dark:text-indigo-400">Score: {score}</span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 md:h-4 mt-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question */}
        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-center mb-6 lg:mb-10 leading-tight text-gray-900 dark:text-white px-4 md:px-6 lg:px-8">
          {question.question}
        </h3>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items} strategy={horizontalListSortingStrategy}>
            <div className="flex flex-row overflow-x-auto gap-6 md:gap-8 lg:gap-10 mt-6 lg:mt-10 pb-6 snap-x snap-mandatory px-4 md:px-6 lg:px-8">
              {items.map((item, index) => (
                <SortableItem key={item.id} id={item.id} text={item.text} index={index} disabled={showResult} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Navigation */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mt-8 px-4 md:px-6 lg:px-8">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className={`px-12 md:px-16 py-5 text-xl font-bold rounded-full shadow-lg transition-all transform w-full md:w-auto
              ${currentIndex === 0 ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60" : "bg-gradient-to-r from-gray-500 to-gray-700 text-white hover:scale-105 active:scale-95"}`}
          >
            Back
          </button>

          {showResult ? (
            <button
              onClick={handleNext}
              className="px-12 md:px-16 py-5 text-xl font-bold rounded-full shadow-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 active:scale-95 transition-all transform w-full md:w-auto"
            >
              {currentIndex + 1 < questions.length ? "Next Question" : "Finish"}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-12 md:px-16 py-5 text-xl font-bold rounded-full shadow-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:scale-105 active:scale-95 transition-all transform w-full md:w-auto"
            >
              Submit Sequence
            </button>
          )}
        </div>

        {/* Result */}
        {showResult && (
          <div className={`mt-8 md:mt-12 p-8 md:p-12 rounded-2xl md:rounded-3xl text-center border-4 animate-fade-in-up mx-4 md:mx-6 lg:mx-8
            ${isCorrect ? "bg-green-50 dark:bg-green-900/40 border-green-500 dark:border-green-400 text-green-700 dark:text-green-300" : "bg-red-50 dark:bg-red-900/40 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300"}`}
          >
            <p className="text-4xl md:text-5xl font-extrabold mb-6">
              {isCorrect ? "Perfect Order! 🎉" : "Wrong Sequence"}
            </p>
            <p className="text-xl md:text-2xl">
              Correct order: <strong>{question.options.join(" → ")}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


