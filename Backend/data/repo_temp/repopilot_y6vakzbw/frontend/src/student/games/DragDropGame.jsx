import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Confetti from "react-confetti";

/* ---------------- Draggable Option ---------------- */
const DraggableOption = ({ id, text, disabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : disabled ? 0.5 : 1,
    scale: isDragging ? 1.05 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(disabled ? {} : attributes)}
      {...(disabled ? {} : listeners)}
      className={`px-8 py-6 rounded-2xl text-xl md:text-2xl font-bold shadow-lg select-none
        min-w-[280px] md:min-w-[360px] flex items-center justify-center text-center transition-all duration-300 snap-center
        ${
          disabled
            ? "opacity-60 cursor-not-allowed bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            : "cursor-grab active:cursor-grabbing bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:scale-105 hover:shadow-2xl active:scale-95"
        }`}
    >
      {text}
    </div>
  );
};

/* ---------------- Drop Zone ---------------- */
const DropZone = ({ children, showResult, isCorrect, isAnswered }) => {
  const { setNodeRef, isOver } = useDroppable({ id: "dropzone" });

  return (
    <div
      ref={setNodeRef}
      className={`w-full h-48 md:h-64 lg:h-80 rounded-3xl
        flex items-center justify-center text-2xl md:text-3xl lg:text-4xl font-bold
        shadow-2xl transition-all duration-300 border-4 mb-8 md:mb-12 px-4 md:px-8 lg:px-12
        ${
          showResult && isCorrect
            ? "bg-green-50 dark:bg-green-900/40 border-green-500 text-green-700 dark:text-green-300 animate-pulse"
            : showResult && !isCorrect
            ? "bg-red-50 dark:bg-red-900/40 border-red-500 text-red-700 dark:text-red-300 animate-pulse"
            : isAnswered
            ? "bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500 text-indigo-700 dark:text-indigo-300"
            : isOver
            ? "bg-indigo-100 dark:bg-indigo-800 border-indigo-500 scale-105 text-indigo-700 dark:text-indigo-300"
            : "bg-gray-100 dark:bg-gray-800 border-dashed border-indigo-400 text-gray-600 dark:text-gray-400"
        }`}
    >
      {children || (isAnswered ? "Your previous answer" : "Drop your answer here")}
    </div>
  );
};

/* ---------------- Main Game ---------------- */
export default function DragDropGame({ questions, onFinish }) {
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [droppedAnswer, setDroppedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [confettiActive, setConfettiActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userAnswers, setUserAnswers] = useState({});

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  useEffect(() => {
    if (questions?.length > 0) {
      const shuffled = [...questions].sort(() => Math.random() - 0.5);
      setShuffledQuestions(shuffled);
      setCurrentIndex(0);
      setScore(0);
      setUserAnswers({});
    }
  }, [questions]);

  const question = shuffledQuestions[currentIndex];

  useEffect(() => {
    if (!question) return;

    const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
    setOptions(shuffledOptions.map((opt, i) => ({ id: `opt-${i}`, text: opt })));

    const prevAnswer = userAnswers[currentIndex];
    setDroppedAnswer(prevAnswer || null);
    setShowResult(!!prevAnswer);
    setIsCorrect(prevAnswer === question.answer);
    setIsSubmitting(false);
  }, [question, currentIndex, userAnswers]);

  const handleDragEnd = ({ active, over }) => {
    if (isSubmitting || showResult || !over || over.id !== "dropzone") return;

    const dragged = options.find((o) => o.id === active.id);
    if (!dragged) return;

    setDroppedAnswer(dragged.text);
    setOptions((prev) => prev.filter((o) => o.id !== active.id));

    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: dragged.text,
    }));
  };

  const handleSubmit = () => {
    if (isSubmitting || !droppedAnswer) return;

    setIsSubmitting(true);

    const correct = droppedAnswer === question.answer;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
      setConfettiActive(true);
      setTimeout(() => setConfettiActive(false), 3000);
    }

    setShowResult(true);

    setTimeout(() => {
      if (currentIndex + 1 < shuffledQuestions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onFinish(score + (correct ? 1 : 0));
      }
    }, 2500);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const progress =
    shuffledQuestions.length > 0
      ? ((currentIndex + 1) / shuffledQuestions.length) * 100
      : 0;

  if (!question) return null;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center p-0 overflow-hidden transition-colors duration-300">
      {confettiActive && <Confetti numberOfPieces={400} gravity={0.12} />}

      {/* Full-screen width container - no max-w, no mx-auto */}
      <div className="w-full bg-white dark:bg-gray-900 rounded-none shadow-none md:shadow-2xl p-4 sm:p-6 lg:p-8 border-0 md:border border-indigo-200 dark:border-indigo-800 flex flex-col min-h-screen transition-colors duration-300">
        {/* Header */}
        <div className="mb-6 md:mb-8 px-4 md:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent mb-6 lg:mb-8">
            Drag & Drop Challenge
          </h2>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-lg md:text-xl font-medium text-gray-900 dark:text-gray-100">
            <span>Question {currentIndex + 1} of {shuffledQuestions.length}</span>
            <span className="text-indigo-600 dark:text-indigo-400">Score: {score}</span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 md:h-4 mt-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-center mb-8 lg:mb-12 leading-tight text-gray-900 dark:text-white px-4 md:px-6 lg:px-8">
          {question.question}
        </h3>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {/* Full-width drop zone - no max-w */}
          <DropZone
            showResult={showResult}
            isCorrect={isCorrect}
            isAnswered={!!droppedAnswer}
          >
            {droppedAnswer || "Drop your answer here"}
          </DropZone>

          {/* Horizontal scrollable options - full width */}
          <SortableContext
            items={options.map((o) => o.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex flex-row overflow-x-auto gap-6 md:gap-8 lg:gap-10 mt-6 lg:mt-10 pb-6 snap-x snap-mandatory px-4 md:px-6 lg:px-8">
              {options.map((opt) => (
                <div key={opt.id} className="snap-center shrink-0">
                  <DraggableOption
                    id={opt.id}
                    text={opt.text}
                    disabled={!!droppedAnswer || showResult || isSubmitting}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Navigation & Submit */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mt-8 lg:mt-12 px-4 md:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className={`px-12 md:px-16 py-5 text-xl font-bold rounded-full shadow-lg transition-all transform w-full md:w-auto
              ${
                currentIndex === 0
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60"
                  : "bg-gradient-to-r from-gray-500 to-gray-700 text-white hover:scale-105 active:scale-95"
              }`}
          >
            Back
          </button>

          {/* Submit / Next */}
          {droppedAnswer && !showResult ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-12 md:px-16 py-5 text-xl font-bold rounded-full shadow-2xl transition-all transform w-full md:w-auto
                ${
                  isSubmitting
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:scale-105 active:scale-95"
                }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Answer"}
            </button>
          ) : showResult ? (
            <button
              onClick={() => {
                if (currentIndex + 1 < shuffledQuestions.length) {
                  setCurrentIndex((prev) => prev + 1);
                } else {
                  onFinish(score + (isCorrect ? 1 : 0));
                }
              }}
              className="px-12 md:px-16 py-5 text-xl font-bold rounded-full shadow-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 active:scale-95 transition-all transform w-full md:w-auto"
            >
              {currentIndex + 1 < shuffledQuestions.length ? "Next Question" : "Finish Quiz"}
            </button>
          ) : null}
        </div>

        {/* Result */}
        {showResult && (
          <div
            className={`mt-8 md:mt-12 p-6 md:p-10 rounded-2xl md:rounded-3xl text-center border-4 animate-fade-in-up mx-4 md:mx-6 lg:mx-8
              ${
                isCorrect
                  ? "bg-green-50 dark:bg-green-900/40 border-green-500 dark:border-green-400 text-green-700 dark:text-green-300"
                  : "bg-red-50 dark:bg-red-900/40 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300"
              }`}
          >
            <p className="text-4xl md:text-5xl font-extrabold mb-4 md:mb-6">
              {isCorrect ? "Correct! 🎉" : "Incorrect ❌"}
            </p>
            <p className="text-lg md:text-2xl">
              Correct answer: <strong>{question.answer}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


