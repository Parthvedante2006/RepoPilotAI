import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY_HERE");

export default function DailyPracticeGame({ questions, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [userAnswers, setUserAnswers] = useState({}); // Preserve for back

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isCorrect = showAnswer && selected === question.answer;

  useEffect(() => {
    const prev = userAnswers[currentIndex];
    if (prev) {
      setSelected(prev.selected);
      setShowAnswer(true);
      setExplanation(prev.explanation);
    } else {
      setSelected(null);
      setShowAnswer(false);
      setExplanation("");
    }
  }, [currentIndex, userAnswers]);

  const handleSelect = (option) => {
    if (showAnswer || userAnswers[currentIndex]) return;
    setSelected(option);
  };

  const generateExplanation = async () => {
    setLoadingExplanation(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Fun explanation for this flashcard:
Question: ${question.question}
Options: ${question.options.join(", ")}
Correct: ${question.answer}
Selected: ${selected}
Short, exciting, motivational. Under 80 words. End with emoji.`;
      const result = await model.generateContent(prompt);
      setExplanation(result.response.text().trim());
    } catch (err) {
      setExplanation(selected === question.answer ? "Nailed it! 🔥" : `Right one is ${question.answer}. Next time! 💪`);
    } finally {
      setLoadingExplanation(false);
    }
  };

  const checkAnswer = () => {
    if (!selected || userAnswers[currentIndex]) return;
    setShowAnswer(true);
    const correct = selected === question.answer;
    if (correct) {
      setCorrectCount(c => c + 1);
      setConfettiActive(true);
      setTimeout(() => setConfettiActive(false), 3000);
    }
    generateExplanation();

    setUserAnswers(prev => ({
      ...prev,
      [currentIndex]: { selected, explanation }
    }));
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      onFinish(correctCount + (isCorrect ? 1 : 0));
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  };

  // Card animation variants
  const cardVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
      rotate: direction > 0 ? 10 : -10,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
      rotate: direction > 0 ? -10 : 10,
    })
  };

  const optionVariants = {
    hidden: { y: 60, opacity: 0, scale: 0.8 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.15, type: "spring", stiffness: 200 }
    }),
    selected: { scale: 1.08, boxShadow: "0 0 30px rgba(168, 85, 247, 0.6)" },
    correct: { background: "linear-gradient(135deg, #10b981, #34d399)", color: "white" },
    wrong: { background: "linear-gradient(135deg, #ef4444, #f87171)", color: "white", x: [0, -10, 10, -10, 0] }
  };

  const [swipeDirection, setSwipeDirection] = useState(1); // 1 = next, -1 = back

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-950 dark:via-purple-950 dark:to-indigo-950 flex items-center justify-center p-0 overflow-hidden transition-colors">
      {confettiActive && <Confetti numberOfPieces={300} gravity={0.15} colors={['#A855F7', '#EC4899', '#3B82F6']} />}

      <div className="w-screen bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-none shadow-none md:shadow-2xl p-4 sm:p-6 lg:p-10 border-0 md:border border-purple-300 dark:border-purple-700 flex flex-col min-h-screen transition-colors relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(168,85,247,0.08),transparent_40%)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(168,85,247,0.12),transparent_40%)] animate-pulse-slow" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.08),transparent_40%)] dark:bg-[radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.12),transparent_40%)] animate-pulse-slower" />
        </div>

        {/* Progress */}
        <div className="mb-6 px-4 md:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between text-base sm:text-lg font-medium mb-3 text-gray-900 dark:text-white">
            <span>Flashcard {currentIndex + 1}/{questions.length}</span>
            <span className="text-purple-600 dark:text-purple-400 font-bold">Correct: {correctCount}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Question Flashcard - Slides in */}
        <div className="relative w-full min-h-[220px] md:min-h-[300px] mb-10 md:mb-12 px-4 md:px-6 lg:px-8 perspective-1000 z-10">
          <AnimatePresence custom={swipeDirection} mode="wait">
            <motion.div
              key={currentIndex}
              custom={swipeDirection}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 rounded-3xl shadow-2xl bg-gradient-to-br from-white via-purple-50 to-indigo-50 dark:from-gray-800 dark:via-purple-950 dark:to-indigo-950 border-4 border-purple-300 dark:border-purple-600 flex items-center justify-center p-6 md:p-10 text-center cursor-pointer overflow-hidden"
              onClick={() => selected && !showAnswer && setShowAnswer(true)}
            >
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight select-none">
                {question.question}
              </h3>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Option Flashcards - Staggered slide-in */}
        <div className="flex-grow px-4 md:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 relative z-10">
          {question.options.map((option, i) => (
            <motion.button
              key={i}
              custom={i}
              variants={optionVariants}
              initial="hidden"
              animate={userAnswers[currentIndex] ? "visible" : "visible"}
              whileHover={userAnswers[currentIndex] ? {} : { scale: 1.06, rotate: i % 2 === 0 ? 2 : -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelect(option)}
              disabled={showAnswer || userAnswers[currentIndex]}
              className={`relative p-6 md:p-8 rounded-3xl text-lg md:text-xl font-medium shadow-xl flex items-center justify-center min-h-[140px] md:min-h-[180px] text-center border-2 overflow-hidden transition-all
                ${
                  showAnswer && option === question.answer
                    ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white border-green-300 animate-pulse"
                    : showAnswer && selected === option
                    ? "bg-gradient-to-br from-red-400 to-rose-500 text-white border-red-300 animate-shake"
                    : selected === option
                    ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-400 scale-105 shadow-2xl"
                    : "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500"
                } ${showAnswer || userAnswers[currentIndex] ? "cursor-not-allowed opacity-90" : "cursor-pointer"}`}
            >
              {/* Glow effect when selected */}
              {selected === option && (
                <motion.div
                  className="absolute inset-0 bg-gradient-radial from-purple-500/40 to-transparent dark:from-purple-600/30"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}

              {option}
            </motion.button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 mt-10 px-4 md:px-6 lg:px-8 z-10">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className={`px-12 md:px-16 py-5 text-xl font-bold rounded-full shadow-lg transition-all transform w-full sm:w-auto
              ${currentIndex === 0 ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60" : "bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:scale-105 active:scale-95"}`}
          >
            Back
          </button>

          {showAnswer || userAnswers[currentIndex] ? (
            <button
              onClick={handleNext}
              className="px-12 md:px-16 py-5 text-xl font-bold rounded-full shadow-2xl bg-gradient-to-r from-green-500 to-teal-600 text-white hover:scale-105 active:scale-95 transition-all transform w-full sm:w-auto"
            >
              {currentIndex + 1 < questions.length ? "Next Card" : "Finish Practice"}
            </button>
          ) : selected ? (
            <button
              onClick={checkAnswer}
              className="px-12 md:px-16 py-5 text-xl font-bold rounded-full shadow-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-105 active:scale-95 transition-all transform w-full sm:w-auto"
            >
              Reveal Answer
            </button>
          ) : null}
        </div>

        {/* Animated Explanation Panel */}
        <AnimatePresence>
          {showAnswer && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="mt-10 p-6 md:p-10 rounded-3xl bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-purple-950 dark:via-gray-900 dark:to-indigo-950 border border-purple-300 dark:border-purple-700 shadow-2xl mx-4 md:mx-6 lg:mx-8 z-10"
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-purple-700 dark:text-purple-300 flex items-center gap-3">
                {isCorrect ? "Epic Win! 🔥" : "Nice Try! 💡"}
              </h3>
              {loadingExplanation ? (
                <div className="flex items-center justify-center py-6 gap-4">
                  <motion.div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                  <span className="text-lg text-purple-600 dark:text-purple-400">Creating magic explanation...</span>
                </div>
              ) : (
                <p className="text-base md:text-lg leading-relaxed text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {explanation}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


