import { useState, useEffect } from "react";   // ← FIXED: added useEffect here
import Confetti from "react-confetti";

export default function MCQGame({ questions, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [confettiActive, setConfettiActive] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Load previous answer when going back
  useEffect(() => {
    const prev = userAnswers[currentIndex];
    if (prev) {
      setSelectedOption(prev);
      setShowResult(true);
    } else {
      setSelectedOption(null);
      setShowResult(false);
    }
  }, [currentIndex, userAnswers]);

  const handleSelect = (option) => {
    if (showResult || userAnswers[currentIndex]) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption || userAnswers[currentIndex]) return;

    const isCorrect = selectedOption === question.answer;
    if (isCorrect) {
      setScore(s => s + 1);
      setConfettiActive(true);
      setTimeout(() => setConfettiActive(false), 3000);
    }

    setShowResult(true);

    setUserAnswers(prev => ({
      ...prev,
      [currentIndex]: selectedOption
    }));
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish(score + (userAnswers[currentIndex] === question.answer ? 1 : 0));
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center p-0 overflow-hidden transition-colors">
      {confettiActive && <Confetti numberOfPieces={300} gravity={0.2} />}

      <div className="w-screen bg-white dark:bg-gray-900 rounded-none shadow-none md:shadow-2xl p-6 md:p-10 lg:p-12 border-0 md:border border-indigo-200 dark:border-indigo-800 flex flex-col min-h-screen transition-colors">
        {/* Header */}
        <div className="mb-6 md:mb-8 px-4 md:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent mb-6 lg:mb-8">
            Multiple Choice Challenge
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
        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-center mb-8 lg:mb-12 leading-tight text-gray-900 dark:text-white px-4 md:px-6 lg:px-8">
          {question.question}
        </h3>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-10 md:mb-12 flex-grow px-4 md:px-6 lg:px-8">
          {question.options.map((option, i) => {
            const base = "p-6 md:p-8 rounded-2xl text-lg md:text-xl font-medium transition-all border-2 shadow-md hover:scale-105 flex items-center justify-center min-h-[100px] md:min-h-[120px] text-center";
            let style = "bg-white border-gray-300 text-gray-900 hover:bg-indigo-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-indigo-950";

            if (showResult && option === question.answer) style = "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/40 dark:border-green-500 dark:text-green-200 animate-pulse";
            else if (showResult && selectedOption === option && option !== question.answer) style = "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/40 dark:border-red-500 dark:text-red-200 animate-shake";
            else if (selectedOption === option) style = "bg-indigo-100 border-indigo-500 text-indigo-800 dark:bg-indigo-900/40 dark:border-indigo-500 dark:text-indigo-200";

            const isDisabled = showResult || userAnswers[currentIndex];

            return (
              <button
                key={i}
                onClick={() => handleSelect(option)}
                disabled={isDisabled}
                className={`${base} ${style} ${isDisabled ? "cursor-not-allowed opacity-80" : ""}`}
              >
                {option}
              </button>
            );
          })}
        </div>

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

          {showResult || userAnswers[currentIndex] ? (
            <button
              onClick={handleNext}
              className="px-12 md:px-16 py-5 text-xl font-bold rounded-full shadow-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 active:scale-95 transition-all transform w-full md:w-auto"
            >
              {currentIndex + 1 < questions.length ? "Next Question" : "Finish Quiz"}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className={`px-12 md:px-16 py-5 text-xl font-bold rounded-full shadow-2xl transition-all transform w-full md:w-auto
                ${!selectedOption ? "bg-gray-400 text-gray-600 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:scale-105 active:scale-95"}`}
            >
              Submit Answer
            </button>
          )}
        </div>

        {/* Result */}
        {showResult && (
          <div
            className={`mt-8 md:mt-12 p-6 md:p-10 rounded-2xl md:rounded-3xl text-center border-4 animate-fade-in-up mx-4 md:mx-6 lg:mx-8
              ${selectedOption === question.answer ? "bg-green-50 dark:bg-green-900/40 border-green-500 dark:border-green-400 text-green-700 dark:text-green-300" : "bg-red-50 dark:bg-red-900/40 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300"}`}
          >
            <p className="text-4xl md:text-5xl font-extrabold mb-4 md:mb-6">
              {selectedOption === question.answer ? "Correct! 🎉" : "Incorrect ❌"}
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


